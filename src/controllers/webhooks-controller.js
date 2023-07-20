/**
 * Module for the WebhooksController.
 *
 * @author Mats Loock
 * @author Maria Fredriksson
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * Authenticates the webhook.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticate (req, res, next) {
    // Use the GitLab secret token to validate the received payload.
    if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) {
      const error = new Error('Invalid token')
      error.status = 401
      next(error)
      return
    }

    next()
  }

  /**
   * Receives a webhook, and creates a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async indexPost (req, res, next) {
    try {
      let iid = null

      // Only interested in issues events. (But still, respond with a 200 for events not supported.)
      if (req.body.event_type === 'issue') {
        // Extract the issue id from the webhook payload
        iid = req.body.object_attributes.iid
      }

      // It is important to respond quickly!
      res.status(200).end()

      // If we have received something with an iid, we have most likely received an issue, and then we can emit an event.
      if (iid) {
        // TODO: Add so that it can be detected in issue is created or if it is updated, and emit suitable events for that.

        // If the issue has action open, that means that it has been created
        if (req.body.object_attributes.action === 'open') {
          const issueInfo = this.#getIssueInfo(req.body)
          res.io.emit('issues/create', issueInfo)

          // If the action is reopen, that means that the issue was closed but has been reopened
        } else if (req.body.object_attributes.action === 'reopen') {
          res.io.emit('issues/open', iid)

          // If the action is close, that means that the issue was closed
        } else if (req.body.object_attributes.action === 'close') {
          res.io.emit('issues/close', iid)

          // If the action is update, that means that the issue was updated
        } else if (req.body.object_attributes.action === 'update') {
          const issueInfo = this.#getIssueInfo(req.body)
          res.io.emit('issues/update', issueInfo)
        }
      }
    } catch (error) {
      const err = new Error('Internal Server Error')
      err.status = 500
      next(err)
    }
  }

  /**
   * Gets some specific information about the issue from a request body.
   *
   * @param {object} requestBody - The request body.
   * @returns {object} - The issue information.
   */
  #getIssueInfo (requestBody) {
    const issueInfo = {
      title: requestBody.object_attributes.title,
      description: requestBody.object_attributes.description,
      id: requestBody.object_attributes.id,
      iid: requestBody.object_attributes.iid,
      state: requestBody.object_attributes.state,
      ownerAvatar: requestBody.user.avatar_url
    }
    return issueInfo
  }
}

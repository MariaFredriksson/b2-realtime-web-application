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
        if (req.body.object_attributes.state === 'opened') {
          res.io.emit('issues/open', iid)
        } else if (req.body.object_attributes.state === 'closed') {
          res.io.emit('issues/close', iid)
        }
      }
    } catch (error) {
      const err = new Error('Internal Server Error')
      err.status = 500
      next(err)
    }
  }
}

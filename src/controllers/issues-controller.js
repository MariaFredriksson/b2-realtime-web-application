/**
 * Module for the IssuesController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

/**
 * Encapsulates a controller.
 */
// Class with different methods, where each method handle a http requests that comes though a route
export class IssuesController {
  /**
   * Displays a list of issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // This method is called when the url ends with just '/issues'
  async index (req, res, next) {
    try {
      const viewData = {
        // Uses the mongoose method find() to get all the issues from the database
        // Then uses map to take what is returned and turn it into an array of objects in plain javascript
        // issues: (await issue.find())
        //   .map(issue => issue.toObject())
      }

      // Tells which file (with sort of html code) to show to the user, and also sends the issues - the viewData which is the array objects just created - so the issues also can be shown to the user
      res.render('issues/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns a HTML form for creating a new issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create (req, res) {
    res.render('issues/create')
  }

  /**
   * Creates a new issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createPost (req, res) {
    console.log(req.body)
    try {
      // const issue = new issue({
      //   // Takes the issuetext from the request body and sets it as issuetext in the new issue
      //   issuetext: req.body.issuetext,
      //   // Sets the author to the username
      //   author: req.session.user
      // })

      // await issue.save()

      // If the save was successful, the code continues here and sends a flash message to the user
      req.session.flash = { type: 'success', text: 'The issue was created successfully.' }
      // Sends the user back to the page issues/
      res.redirect('.')

      // If there is an error during the save, the code goes here
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The issue is longer than the maximum allowed length (1000).'
      }
      // Displays an error flash message to the user
      req.session.flash = { type: 'danger', text: error.message }
      // Redirects the user to the create page, so they can try again
      res.redirect('./create')
    }
  }

  /**
   * Returns a HTML form for updating a issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async update (req, res) {
    try {
      // const issue = await issue.findById(req.params.id)

      // res.render('issues/update', { viewData: issue.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      // Redirects to the issues page
      res.redirect('..')
    }
  }

  /**
   * Updates a specific issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost (req, res) {
    try {
      // const issue = await issue.findById(req.params.id)

      // if (issue) {
      //   // issue.issuetext = req.body.issuetext

      //   // await issue.save()

      //   req.session.flash = { type: 'success', text: 'The issue was updated successfully.' }
      // } else {
      //   req.session.flash = {
      //     type: 'danger',
      //     text: 'The issue you attempted to update was removed by another user after you got the original values.'
      //   }
      // }
      res.redirect('..')
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The issue is longer than the maximum allowed length (1000).'
      }
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }

  /**
   * Returns a HTML form for deleting a issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async delete (req, res) {
    try {
      // const issue = await issue.findById(req.params.id)

      // res.render('issues/delete', { viewData: issue.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Deletes the specified issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deletePost (req, res) {
    try {
      // await issue.findByIdAndDelete(req.body.id)

      req.session.flash = { type: 'success', text: 'The issue was deleted successfully.' }
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./delete')
    }
  }
}

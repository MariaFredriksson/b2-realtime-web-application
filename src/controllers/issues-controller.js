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
   * The private token.
   *
   * @type {string}
   */
  #token = process.env.PRIVATE_TOKEN

  /**
   * The project ID.
   *
   * @type {string}
   */
  #projectID = process.env.PROJECT_ID

  /**
   * The API URL.
   *
   * @type {string}
   */
  #apiUrl = `https://gitlab.lnu.se/api/v4/projects/${this.#projectID}/issues`

  /**
   * Displays a list of issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      const response = await fetch(this.#apiUrl, {
        headers: {
          'PRIVATE-TOKEN': this.#token
        }
      })

      if (!response.ok) {
        throw new Error(`The issues could not be fetched. Please try again later. Status: ${response.status}`)
      }

      const issuesJson = await response.json()

      // Extract the desired information from each issue
      const extractedIssues = issuesJson.map(issue => ({
        title: issue.title,
        description: issue.description,
        id: issue.id,
        iid: issue.iid,
        state: issue.state,
        ownerAvatar: issue.author.avatar_url
      }))

      // console.log(extractedIssues)

      const viewData = {
        issues: extractedIssues
      }

      // Tells which file (with sort of html code) to show to the user, and also sends the issues - the viewData which is the array objects just created - so the issues also can be shown to the user
      res.render('issues/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Closes an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  // This is an arrow function so that the 'this' keyword is automatically inherited from the class
  closePost = async (req, res) => {
    const issueIid = req.params.iid
    const apiUrlClose = `${this.#apiUrl}/${issueIid}`

    // Get the issue with this iid from the issues array
    // const issue = this.#issues.find(issue => issue.iid === issueIid)

    try {
      const response = await this.#fetchOpenCloseIssues(this.#token, apiUrlClose, 'close')

      if (!response.ok) {
        // Throw an error with an error message
        throw new Error(`The issue could not be closed. Please try again later. Status: ${response.status}`)
      }

      req.session.flash = { type: 'success', text: `Issue #${issueIid} was closed successfully.` }

      // Don't have this here, since it is called when the GitLab api has been called, and then there is a hook that says that everything is ok, and then this is emitted from there
      // res.io.emit('issues/close', issueIid)

      // Redirect back to the original page
      res.redirect('/issues')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('/issues')
    }
  }

  /**
   * Opens an issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  openPost = async (req, res) => {
    const issueIid = req.params.iid
    const apiUrlOpen = `${this.#apiUrl}/${issueIid}`

    try {
      const response = await this.#fetchOpenCloseIssues(this.#token, apiUrlOpen, 'reopen')

      if (!response.ok) {
        // Throw an error with an error message
        throw new Error(`The issue could not be opened. Please try again later. Status: ${response.status}`)
      }

      req.session.flash = { type: 'success', text: `Issue #${issueIid} was opened successfully.` }

      // Don't have this here, since it is called when the GitLab api has been called, and then there is a hook that says that everything is ok, and then this is emitted from there
      // res.io.emit('issues/open', issueIid)

      // Redirect back to the original page
      res.redirect('/issues')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('/issues')
    }
  }

  /**
   * Makes a fetch request to open or close an issue.
   *
   * @param {string} token - The private token.
   * @param {string} apiUrl - The url to the api.
   * @param {string} action - The action to perform.
   * @returns {Promise} - The response from the fetch request.
   */
  async #fetchOpenCloseIssues (token, apiUrl, action) {
    // There is not try catch here because the try catch is in the methods that call this method, and any errors should propagate up to those methods

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ state_event: action })
    })

    return response
  }
}

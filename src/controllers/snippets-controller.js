/**
 * Module for the SnippetsController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Snippet } from '../models/snippet.js'

/**
 * Encapsulates a controller.
 */
// Class with different methods, where each method hanlde a http requests that comes though a route
export class SnippetsController {
  #issues = []

  /**
   * Displays a list of snippets.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  // This method is called when the url ends with just '/snippets'
  async index (req, res, next) {
    const token = process.env.PRIVATE_TOKEN
    const projectID = process.env.PROJECT_ID
    const apiUrl = `https://gitlab.lnu.se/api/v4/projects/${projectID}/issues`

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'PRIVATE-TOKEN': token
        }
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const issuesJson = await response.json()
      // console.log(issues)

      // Extract the desired information from each issue
      const extractedIssues = issuesJson.map(issue => ({
        title: issue.title,
        description: issue.description,
        id: issue.id,
        iid: issue.iid,
        state: issue.state,
        ownerAvatar: issue.author.avatar_url
      }))

      this.#issues = extractedIssues

      console.log(extractedIssues)

      const viewData = {
        // Uses the mongoose method find() to get all the snippets from the database
        // Then uses map to take what is returned and turn it into an array of objects in plain javascript
        // snippets: (await Snippet.find())
        //   .map(snippet => snippet.toObject())

        issues: extractedIssues
      }

      // Tells which file (with sort of html code) to show to the user, and also sends the snippets - the viewData which is the array objects just created - so the snippets also can be shown to the user
      res.render('snippets/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async closePost (req, res) {
    // TODO: Make this not copied
    const token = process.env.PRIVATE_TOKEN
    const projectID = process.env.PROJECT_ID
    const issueIid = req.params.iid
    const apiUrl = `https://gitlab.lnu.se/api/v4/projects/${projectID}/issues/${issueIid}`

    // Get the issue with this iid from the issues array
    // const issue = this.#issues.find(issue => issue.iid === issueIid)

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'PRIVATE-TOKEN': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state_event: 'close' })
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      console.log('Issue closed successfully.')

      res.io.emit('snippet/close', issueIid)

      // const snippet = await Snippet.findById(req.params.id)

      // if (snippet) {
      //   snippet.snippettext = req.body.snippettext

      //   await snippet.save()

      //   req.session.flash = { type: 'success', text: 'The snippet was updated successfully.' }
      // } else {
      //   req.session.flash = {
      //     type: 'danger',
      //     text: 'The snippet you attempted to update was removed by another user after you got the original values.'
      //   }
      // }
      // res.redirect('..')

      // Redirect back to the original page
      res.redirect('/snippets')
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The snippet is longer than the maximum allowed length (1000).'
      }
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }

  /**
   * Updates a specific snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async openPost (req, res) {
    // TODO: Make this not copied
    const token = process.env.PRIVATE_TOKEN
    const projectID = process.env.PROJECT_ID
    const issueIid = req.params.iid
    const apiUrl = `https://gitlab.lnu.se/api/v4/projects/${projectID}/issues/${issueIid}`

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'PRIVATE-TOKEN': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state_event: 'reopen' })
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      console.log('Issue closed successfully.')

      res.io.emit('snippet/open', issueIid)

      // const snippet = await Snippet.findById(req.params.id)

      // if (snippet) {
      //   snippet.snippettext = req.body.snippettext

      //   await snippet.save()

      //   req.session.flash = { type: 'success', text: 'The snippet was updated successfully.' }
      // } else {
      //   req.session.flash = {
      //     type: 'danger',
      //     text: 'The snippet you attempted to update was removed by another user after you got the original values.'
      //   }
      // }
      // res.redirect('..')

      // Redirect back to the original page
      res.redirect('/snippets')
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The snippet is longer than the maximum allowed length (1000).'
      }
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }

  /**
   * Returns a HTML form for creating a new snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async create (req, res) {
    res.render('snippets/create')
  }

  /**
   * Creates a new snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async createPost (req, res) {
    console.log(req.body)
    try {
      const snippet = new Snippet({
        // Takes the snippettext from the request body and sets it as snippettext in the new snippet
        snippettext: req.body.snippettext,
        // Sets the author to the username
        author: req.session.user
      })

      await snippet.save()

      // If the save was successful, the code continues here and sends a flash message to the user
      req.session.flash = { type: 'success', text: 'The snippet was created successfully.' }
      // Sends the user back to the page snippets/
      res.redirect('.')

      // If there is an error during the save, the code goes here
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The snippet is longer than the maximum allowed length (1000).'
      }
      // Displays an error flash message to the user
      req.session.flash = { type: 'danger', text: error.message }
      // Redirects the user to the create page, so they can try again
      res.redirect('./create')
    }
  }

  /**
   * Returns a HTML form for updating a snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async update (req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      res.render('snippets/update', { viewData: snippet.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      // Redirects to the snippets page
      res.redirect('..')
    }
  }

  /**
   * Updates a specific snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost (req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      if (snippet) {
        snippet.snippettext = req.body.snippettext

        await snippet.save()

        req.session.flash = { type: 'success', text: 'The snippet was updated successfully.' }
      } else {
        req.session.flash = {
          type: 'danger',
          text: 'The snippet you attempted to update was removed by another user after you got the original values.'
        }
      }
      res.redirect('..')
    } catch (error) {
      if (error.message.includes('is longer than the maximum allowed length (1000)')) {
        error.message = 'The snippet is longer than the maximum allowed length (1000).'
      }
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }

  /**
   * Returns a HTML form for deleting a snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async delete (req, res) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      res.render('snippets/delete', { viewData: snippet.toObject() })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Deletes the specified snippet.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async deletePost (req, res) {
    try {
      await Snippet.findByIdAndDelete(req.body.id)

      req.session.flash = { type: 'success', text: 'The snippet was deleted successfully.' }
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./delete')
    }
  }
}

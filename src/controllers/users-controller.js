/**
 * Module for the UsersController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { User } from '../models/user.js'

/**
 * Encapsulates a controller.
 */
export class UsersController {
  /**
   * Handles the index route for the users. Redirects to login.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  index (req, res) {
    res.redirect('./users/login')
  }

  /**
   * Handles the create route for the users.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  create (req, res) {
    res.render('users/create')
  }

  /**
   * Creates a new user account in the system.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async createPost (req, res, next) {
    try {
      const user = new User({
        username: req.body.username,
        password: req.body.password
      })

      await user.save()

      req.session.flash = { type: 'success', text: `Welcome ${user.username}! Your account was successfully created. Please log in.` }
      res.redirect('./login')
    } catch (error) {
      if (error.message.includes('E11000 duplicate key error collection')) {
        error.message = 'The username is already taken. Please try another one.'
      }

      if (error.message.includes('is longer than the maximum allowed length (50)')) {
        error.message = 'The username is too long. Please try something shorter than 50 characters.'
      }

      req.session.flash = { type: 'danger', text: error.message }

      // Redirects the user to the create page, so they can try again
      res.redirect('./create')
    }
  }

  /**
   * Handles the login route for the users.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  login (req, res) {
    res.render('users/login')
  }

  /**
   * Handles the logic for a user logging in to the application.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async loginPost (req, res) {
    try {
      const user = await User.authenticate(req.body.username, req.body.password)

      // Makes sure that there is a new fresh session when logging in
      req.session.regenerate(() => {
        // Save the username in the session so it can be accessed from everywhere during the session.
        req.session.user = user.username

        // Make sure the session is saved before everything else
        req.session.save(() => {
          req.session.flash = { type: 'success', text: `Welcome ${user.username}!` }
          console.log(`req.session.flash: ${req.session.flash}`)
          res.status(200)
          res.redirect('../snippets')
        })
      })
    } catch (error) {
      req.session.flash = { type: 'danger', text: 'Login failed. Please try again.' }
      res.status(401)
      res.redirect('./login')
    }
  }

  /**
   * Renders the logout page.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  logout (req, res) {
    res.render('users/logout')
  }

  /**
   * Destroys the user's session when the user is logging out.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async logoutPost (req, res, next) {
    try {
      req.session.destroy((err) => {
        if (err) {
          throw err
        }
        res.clearCookie('connect.sid')
        res.redirect('..')
      })
    } catch (error) {
      next(error)
    }
  }
}

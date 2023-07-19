/**
 * Module for the AuthorizationController.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import { Snippet } from '../models/snippet.js'

/**
 * Encapsulates a controller.
 */
export class AuthorizationController {
  /**
   * Middleware to check if the user is logged in and thereby authorized to access the resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   *
   * @returns {undefined}
   */
  userLoggedIn (req, res, next) {
    // If the user is not logged in
    if (!req.session.user) {
      const error = new Error('Not found')
      error.status = 404
      return next(error)
    }

    // If the user is logged in
    next()
  }

  /**
   * Middleware to check if the user is NOT logged in and thereby authorized to access the resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   *
   * @returns {undefined}
   */
  userNOTLoggedIn (req, res, next) {
    // If the user is logged in
    if (req.session.user) {
      const error = new Error('Forbidden')
      error.status = 403
      return next(error)
    }

    // If the user is not logged in
    next()
  }

  /**
   * Middleware to check if the user is the author and thereby authorized to access the resource.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   *
   * @returns {undefined}
   */
  async userIsAuthor (req, res, next) {
    try {
      const snippet = await Snippet.findById(req.params.id)

      // If the user is not the author
      if (req.session.user !== snippet.author) {
        const error = new Error('Forbidden')
        error.status = 403
        return next(error)
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}

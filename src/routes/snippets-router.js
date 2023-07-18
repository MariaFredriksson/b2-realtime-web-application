/**
 * Snippets routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { SnippetsController } from '../controllers/snippets-controller.js'
import { AuthorizationController } from '../controllers/authorization-controller.js'

export const router = express.Router()

const controller = new SnippetsController()
const authorizationController = new AuthorizationController()

// Map HTTP verbs and route paths to controller action methods.

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/create', authorizationController.userLoggedIn, controller.create)
router.post('/create', authorizationController.userLoggedIn, controller.createPost)

router.get('/:id/update', authorizationController.userLoggedIn, authorizationController.userIsAuthor, controller.update)
router.post('/:id/update', authorizationController.userLoggedIn, authorizationController.userIsAuthor, controller.updatePost)

router.get('/:id/delete', authorizationController.userLoggedIn, authorizationController.userIsAuthor, controller.delete)
router.post('/:id/delete', authorizationController.userLoggedIn, authorizationController.userIsAuthor, controller.deletePost)

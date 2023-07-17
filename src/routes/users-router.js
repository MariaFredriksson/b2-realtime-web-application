/**
 * Users routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { UsersController } from '../controllers/users-controller.js'
import { AuthorizationController } from '../controllers/authorization-controller.js'

export const router = express.Router()

const controller = new UsersController()
const authorizationController = new AuthorizationController()

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/create', authorizationController.userNOTLoggedIn, controller.create)
router.post('/create', authorizationController.userNOTLoggedIn, controller.createPost)

router.get('/login', authorizationController.userNOTLoggedIn, controller.login)
router.post('/login', authorizationController.userNOTLoggedIn, controller.loginPost)

router.get('/logout', authorizationController.userLoggedIn, controller.logout)
router.post('/logout', authorizationController.userLoggedIn, controller.logoutPost)

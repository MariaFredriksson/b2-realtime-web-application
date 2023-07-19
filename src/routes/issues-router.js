/**
 * Issues routes.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import { IssuesController } from '../controllers/issues-controller.js'

export const router = express.Router()

const controller = new IssuesController()

// Map HTTP verbs and route paths to controller action methods.

router.get('/', (req, res, next) => controller.index(req, res, next))

router.post('/:iid/close', controller.closePost)

router.post('/:iid/open', controller.openPost)

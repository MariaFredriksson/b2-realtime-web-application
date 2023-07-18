/**
 * The starting point of the application.
 *
 * @author Maria Fredriksson
 * @version 1.0.0
 */

import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import session from 'express-session'
import logger from 'morgan'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import helmet from 'helmet'

try {
  // Connect to MongoDB.
  await connectDB()

  // Creates an Express application.
  const expressApp = express()

  expressApp.use(helmet())

  // Allow bootstrap
  // Copied from classmates Jimmy and Anja
  expressApp.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'http://cscloud7-221.lnu.se', 'https://cscloud7-221.lnu.se'],
        scriptSrc: ["'self'", 'http://cscloud7-221.lnu.se', 'https://cscloud7-221.lnu.se', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js'],
        styleSrc: ["'self' 'sha256-C10ckPX58XkzBNWy4e868LvAA4fm0QL2DtLaJ9RSRUg=' 'sha256-pOsDecCHeNhB9mZk/2O7+QXigySvqK5k2YS2NayMpOw='", 'http://cscloud7-221.lnu.se', 'https://cscloud7-221.lnu.se', 'https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css']
      }
    })
  )

  // Get the directory name of this module's path.
  const directoryFullName = dirname(fileURLToPath(import.meta.url))

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || '/'

  // Set up a morgan logger using the dev format for log entries.
  // The 'dev' format is a predefined string that stands for :method :url :status :response-time ms - :res[content-length]
  expressApp.use(logger('dev'))

  // View engine setup.
  // Tells the app that ejs should be used as the view engine to render templates
  expressApp.set('view engine', 'ejs')

  // Points out the folder where express should look for templates when res.render() is called
  expressApp.set('views', join(directoryFullName, 'views'))

  // This line applies the express-ejs-layouts middleware to the Express application. This middleware allows you to use layouts with EJS templates.
  expressApp.use(expressLayouts)

  // Points out the path where to look for the default layout that will be used in all views
  expressApp.set('layout', join(directoryFullName, 'views', 'layouts', 'default'))

  // Parse requests of the content type application/x-www-form-urlencoded.
  // Populates the request object with a body object (req.body).
  // Takes the input from the user (the snippet) that is sent to the server in a special format (application/x-www-form-urlencoded), and puts the data into req.body as an object with key value pairs
  // Takes the inputted snippet from the user and makes it available in the application
  // extended:false is about which library this middleware should use
  expressApp.use(express.urlencoded({ extended: false }))

  // Serve static files.
  // Tell express where to look for files that always should be used on the site, like the css file now (could be images, js-files etc otherwise also)
  expressApp.use(express.static(join(directoryFullName, '..', 'public')))

  // Setup and use session middleware (https://github.com/expressjs/session)
  const sessionOptions = {
    name: process.env.SESSION_NAME, // Don't use default session cookie name.
    secret: process.env.SESSION_SECRET, // Change it!!! The secret is used to hash the session with HMAC.
    resave: false, // Resave even if a request is not changing the session.
    saveUninitialized: false, // Don't save a created but not modified session.
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: 'strict' // Prevents against CSRF attacks
    }
  }

  // If the app is in production, extra layers of security are added
  if (expressApp.get('env') === 'production') {
    // Shows that this express application is run behind a reverse proxy, and which proxy that is trusted
    expressApp.set('trust proxy', 1) // trust first proxy

    // Tells the web browser to only send session cookies over HTTPS
    sessionOptions.cookie.secure = true // serve secure cookies
  }

  // Adds the session middleware to the express app, with the options that are in sessionOptions
  // When the session middleware is added to the Express application, it will automatically handle the creation and management of sessions for the application. This includes:
  // Generating a new session ID and storing the session data on the server when a new session is created.
  // Reading the session ID from the session ID cookie in the request and retrieving the corresponding session data from the server.
  // Updating the session data and the session ID cookie when the session data is modified.
  // Also a property called session is addes to the req object
  expressApp.use(session(sessionOptions))

  // Middleware to be executed before the routes.
  // Tells express to run this function for every incoming request
  // Since this executes before any routes, this flash message, baseURL, and username are available for all views
  expressApp.use((req, res, next) => {
    // Flash messages - survives only a round trip.
    if (req.session.flash) {
      // Copies the flash message so it can be accessed in views
      res.locals.flash = req.session.flash
      delete req.session.flash
    }

    if (req.session.user) {
      // Copies the username  so it can be accessed in views
      res.locals.user = req.session.user
    }

    // Pass the base URL to the views.
    res.locals.baseURL = baseURL

    // This middleware function is done, so therefore it passes control to the next middleware or route in the chain that express has specified
    next()
  })

  // Register routes.
  // The app.use() method is used to register middleware functions or objects with the Express application. The first argument passed to the app.use() method is the path that the middleware function or object should handle. In this case, the path is /, which means that the middleware function or object should handle all requests to the root path of the application.
  // router is the middleware object
  expressApp.use('/', router)

  // Error handler.
  // Good that this is placed at the end of the middleware chain, so this handler can take care of the errors that are not caught in the other middlewares of routes
  expressApp.use(function (err, req, res, next) {
    // 404 Not Found.
    if (err.status === 404) {
      return res
        .status(404)
        .sendFile(join(directoryFullName, 'views', 'errors', '404.html'))
    }

    // 403 Forbidden.
    if (err.status === 403) {
      return res
        .status(403)
        .sendFile(join(directoryFullName, 'views', 'errors', '403.html'))
    }

    // 500 Internal Server Error (in production, all other errors send this response).
    if (req.app.get('env') !== 'development') {
      // Sets a status of 500 to the response object, and sends a file that is located in views/errors folder
      return res
        .status(500)
        .sendFile(join(directoryFullName, 'views', 'errors', '500.html'))
    }

    // Development only!
    // Only providing detailed error in development.

    // Render the error page.
    res
      .status(err.status || 500)
      .render('errors/error', { error: err })
  })

  // Starts the HTTP server listening for connections.
  // This line of code starts the web server and makes it listen on the specified port, so that it can start processing incoming requests and sending back responses. This is the final step in the process of setting up the server and starting the application.
  expressApp.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (err) {
  console.error(err)
  process.exitCode = 1
}

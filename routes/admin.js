const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../controllers/userController')
const siteController = require('../controllers/siteController')
const tripController = require('../controllers/tripController')
const authenticated = passport.authenticate('jwt', { session: false })
const isAdmin = require('../utils/isAdmin')

router.all('*', authenticated, isAdmin)
router.get('/users', userController.getUsers)
router.delete('/users/:id', userController.deleteUser)
router.get('/sites', siteController.getSites)
router.delete('/sites/:id', siteController.deleteSite)
router.get('/trips', tripController.getTrips)
router.delete('/trips/:id', tripController.adminDeleteTrip)

module.exports = router

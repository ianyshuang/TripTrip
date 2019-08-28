const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('passport')
const issueToken = require('../utils/issue_token')

router.post('/signin', passport.authenticate('local', { session: false }), issueToken, userController.signin)
router.post('/signup', userController.signup)

router.use('/facebook', require('./facebook'))
router.use('/google', require('./google'))
router.use('/sites', require('./sites'))
router.use('/trips', require('./trips'))
router.use('/users', require('./users'))

module.exports = router

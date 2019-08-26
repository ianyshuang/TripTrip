const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('../config/passport')

const authenticated = passport.authenticate('jwt', { session: false })
const authenticate_forgot = require('../utils/verify_token')

router
  .route('/:id')
  .get(userController.getUser)

router.post('/forgot_password', userController.issueForgotPasswordToken)
router.get('/validate_reset', authenticate_forgot, userController.validateReset)
router.patch('/reset_password', authenticate_forgot, userController.resetPassword)

module.exports = router

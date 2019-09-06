const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = passport.authenticate('jwt', { session: false })
const authenticate_forgot = require('../utils/verify_token')

router
  .route('/')
  .get(authenticated, userController.getUser)
  .patch(authenticated, upload.single('image'), userController.editProfile)
router.get('/:id', userController.getUserById)
router.post('/forgot_password', userController.issueForgotPasswordToken)
router.get('/validate_reset/:randomCode', authenticate_forgot, userController.validateReset)
router.patch('/reset_password', authenticate_forgot, userController.resetPassword)

module.exports = router

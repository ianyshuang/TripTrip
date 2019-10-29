const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('../config/passport')
const multer = require('multer')
const upload = multer({ dest: '/tmp/' })

const authenticated = passport.authenticate('jwt', { session: false })
const authenticateForgot = require('../utils/verify_token')

router
  .route('/')
  .get(authenticated, userController.getUser)
  .patch(authenticated, upload.single('image'), userController.editProfile)
router.post('/forgot_password', userController.issueForgotPasswordToken)
router.get('/validate_reset/:randomCode', authenticateForgot, userController.validateReset)
router.patch('/reset_password', authenticateForgot, userController.resetPassword)
router.get('/:id', userController.getUserById)
router.get('/:id/profile', userController.getProfileById)

module.exports = router

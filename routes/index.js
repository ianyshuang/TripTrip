const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('passport')

const authencitcated = passport.authenticate('jwt', { session: false })

router.post('/signin', passport.authenticate('local', { session: false }), userController.signin)
router.post('/signup', userController.signup)
router.get('/test', authencitcated, (req, res) => {
  console.log(req.user)
  res.status(200).send('success!')
})

module.exports = router
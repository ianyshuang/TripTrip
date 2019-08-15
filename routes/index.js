const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('passport')
const User = require('../models/user')

const authencitcated = passport.authenticate('jwt', { session: false })

router.post('/signin', passport.authenticate('local', { session: false }), userController.signin)
router.post('/signup', userController.signup)
router.get('/test', authencitcated, async (req, res) => {
  console.log(req.user)
  try {
    const user = await User.create({
      firstName: 'ian',
      lastName: 'huang',
      email: 'ianyshuang@gmail.com',
      password: '1234',
      introduction: 'hi, 我叫翌軒！',
    })
    console.log(user)
    res.status(200).send('success!')
  } catch (error) {
    console.log(error)
    res.status(500).send('something wrong...')
  }
})

module.exports = router
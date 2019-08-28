const express = require('express')
const router = express.Router()
const passport = require('passport')
const issueToken = require('../utils/issue_token')

router.get('/', passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false }))
router.get('/redirect', passport.authenticate('facebook', { session: false }), issueToken, (req, res) => {
  res.status(200).end()
})
router.get('/test', (req, res) => {
  res.send('<a href="/facebook"> facebook login </a>')
})

module.exports = router
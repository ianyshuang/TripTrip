const express = require('express')
const router = express.Router()
const passport = require('passport')
const issueToken = require('../utils/issue_token')

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/redirect', passport.authenticate('google', { session: false }), issueToken, (req, res) => { res.status(200).end() })
router.get('/test', (req, res) => {
  res.send('<a href="/google"> google login </a>')
})
module.exports = router
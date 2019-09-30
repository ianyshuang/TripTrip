const express = require('express')
const router = express.Router()
const passport = require('passport')
const issueToken = require('../utils/issue_token')
const redirectBaseUrl = process.env.NODE_ENV === 'production' ? 'https://triptrip-backend.herokuapp.com/#' : 'http://localhost:8080/#'

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get(
  '/redirect',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) { return res.redirect(`${redirectBaseUrl}/redirect?error=true`) }
      if (Object.keys(info).length !== 0) {
        return res.redirect(`${redirectBaseUrl}/redirect?status=${info.status}`)
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) return next(err)
        next()
      })
    })(req, res, next)
  },
  issueToken,
  (req, res) => {
    res.redirect(`${redirectBaseUrl}/redirect`)
  }
)

module.exports = router

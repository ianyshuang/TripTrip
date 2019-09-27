const express = require('express')
const router = express.Router()
const passport = require('passport')
const issueToken = require('../utils/issue_token')

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get(
  '/redirect',
  (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
      if (err) { return res.redirect('http://localhost:8080/#/redirect?error=true') }
      if (Object.keys(info).length !== 0) {
        return res.redirect(
          `http://localhost:8080/#/redirect?status=${info.status}`
        )
      }
      req.logIn(user, { session: false }, (err) => {
        if (err) return next(err)
        next()
      })
    })(req, res, next)
  },
  issueToken,
  (req, res) => {
    res.redirect('http://localhost:8080/#/redirect')
  }
)

module.exports = router

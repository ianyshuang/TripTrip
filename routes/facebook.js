const express = require('express')
const router = express.Router()
const passport = require('passport')
const issueToken = require('../utils/issue_token')

router.get('/', passport.authenticate('facebook', { scope: ['email', 'public_profile'], session: false }))
router.get(
  '/redirect',
  (req, res, next) => {
    passport.authenticate('facebook', (err, user, info) => {
      if (err)
        return res.redirect('http://localhost:8080/#/redirect?error=true')
      if (info)
        return res.redirect(
          `http://localhost:8080#/redirect?status=${info.status}`
        )
      next()
    })(req, res, next)
  },
  issueToken,
  (req, res) => {
    res.redirect('http://localhost:8080/#/redirect')
  }
)

module.exports = router
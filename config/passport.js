const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')
const JwtStrategy = require('passport-jwt').Strategy


passport.use(
  // 用 req.body.email 驗證
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) return done(null, false, { status: 404, message: '此 email 尚未註冊！'})
        if (!bcrypt.compareSync(password, user.password)) return done(null, false, { status: 401, message: '密碼錯誤！'})
        return done(null, user)
      })
      .catch(error => done(error))
  })
)

passport.use(
  new JwtStrategy({
    jwtFromRequest: req => req.cookies.token,
    secretOrKey: process.env.JWT_SECRET
  }, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (!user) return done(null, false)
        return done(null, user)
      })
  })
)

module.exports = passport
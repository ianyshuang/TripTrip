const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const crypto = require('crypto')
const JwtStrategy = require('passport-jwt').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(
  // 用 req.body.email 驗證
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
       const user = await User.findOne({ email })
        if (!user) {
          return done(null, false, 404)
        } else {
          const hash = crypto.createHash('md5').update(password, 'utf-8').digest('hex')
          if (user.password !== hash) return done(null, false, 422)
          return done(null, user)
        }
    } catch (error) {
      console.log(error)
      return done(error)
    }
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

let facebookCallback = ''
let googleCallback = ''
if (process.env.NODE_ENV === 'production') {
  facebookCallback = process.env.BASE_URL + '/facebook/redirect'
  googleCallback = process.env.BASE_URL + '/google/redirect'
} else {
  facebookCallback = 'http://localhost:3000/facebook/redirect'
  googleCallback = 'http://localhost:3000/google/redirect'
}

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: facebookCallback,
      profileFields: ['email', 'displayName', 'picture.type(large)']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ email: profile._json.email })
        if (user) {
          if (user.accountType !== 'facebook') {
            return done(null, false, { status: 409 })
          } else {
            return done(null, user)
          }
        } else {
          var randomPassword = Math.random().toString(36).slice(-8)
          const newUser = await User.create({
            username: profile.displayName || ' ',
            email: profile._json.email,
            password: crypto.createHash('md5').update(randomPassword, 'utf-8').digest('hex'),
            avatar: profile.photos[0].value || process.env.BASE_URL + '/img/user.png',
            accountType: 'facebook'
          })
          return done(null, newUser)
        }
      } catch (error) {
        console.log(error)
        return done(error)
      }
    }
  )
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: googleCallback
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ email: profile._json.email })
        if (user) {
          if (user.accountType !== 'google') {
            return done(null, false, { status: 409 })
          } else {
            return done(null, user)
          }
        } else {
          var randomPassword = Math.random()
            .toString(36)
            .slice(-8)
          const newUser = await User.create({
            username: profile.displayName || ' ',
            email: profile._json.email,
            password: crypto.createHash('md5').update(randomPassword, 'utf-8').digest('hex'),
            avatar: profile._json.picture || process.env.BASE_URL + '/img/user.png',
            accountType: 'google'
          })
          return done(null, newUser)
        }
      } catch (error) {
        console.log(error)
        return done(error)
      }
    }
  )
)

module.exports = passport

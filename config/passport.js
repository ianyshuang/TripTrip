const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')
const JwtStrategy = require('passport-jwt').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(
  // 用 req.body.email 驗證
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) return done(null, false, 404)
        if (!bcrypt.compareSync(password, user.password)) return done(null, false, 401)
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

let facebookCallback = ''
let googleCallback = ''
if (process.env.NODE_ENV === 'production') {
  facebookCallback = 'https://triptrip-backend.herokuapp.com/facebook/redirect'
  googleCallback = 'https://triptrip-backend.herokuapp.com/google/redirect'
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
          console.log('already exist')
          return done(null, false, { status: 404 })
        } else {
          var randomPassword = Math.random()
            .toString(36)
            .slice(-8)
          const newUser = await User.create({
            username: profile.displayName ? profile.displayName : ' ',
            email: profile._json.email,
            password: bcrypt.hashSync(
              randomPassword,
              bcrypt.genSaltSync(10),
              null
            ),
            avatar: profile.photos[0].value ? profile.photos[0].value : null
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
          console.log('already exist')
          return done(null, user)
        } else {
          var randomPassword = Math.random()
            .toString(36)
            .slice(-8)
          const newUser = await User.create({
            username: profile.displayName ? profile.displayName : ' ',
            email: profile._json.email,
            password: bcrypt.hashSync(
              randomPassword,
              bcrypt.genSaltSync(10),
              null
            ),
            avatar: profile.picture ? profile.picture : null
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

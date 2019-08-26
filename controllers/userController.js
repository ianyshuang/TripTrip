const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Trip = require('../models/trip')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')

const userController = {
  async signin (req, res) {
    const payload = { id: req.user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    res.cookie('token', token, {
      expires: new Date(Date.now() + 1000 * 3600 * 24),
      httpOnly: true
    })
    try {
      const user = await User.findById(req.user.id).select('-password')
      if (!user) {
        res.status(404).end()
      } else {
        const data = { ...user._doc }
        data.collectedTrips = await Trip.find({_id: { $in: data.collectedTrips }})
        data.ownedTrips = await Trip.find({_id: { $in: data.ownedTrips }})
        res.status(200).send(data)
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  signup (req, res) {
    const { email, password, firstName, lastName } = req.body
    if (!email || !password) {
      return res.status(400).send('email or password cannot be null!')
    }
    User.findOne({ email })
      .then(user => {
        if (user) return res.status(403).send({ message: '此 email 已被註冊過!' })
        return User.create({
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
          firstName: firstName || ' ',
          lastName: lastName || ' '
        }).then(user => res.status(201).send({ message: '成功註冊!' }))
      }).catch(error => console.log(error))
  },
  async getUser (req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password ')
      if (!user) {
        res.status(404).end()
        return
      } else {
        const data = { ...user._doc }
        data.collectedTrips = await Trip.find({ _id: { $in: data.collectedTrips }})
        data.ownedTrips = await Trip.find({ _id: { $in: data.ownedTrips }})
        res.status(200).send(data)
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async issueForgotPasswordToken (req, res) {
    const { email } = req.body
    if (!email) {
      res.status(400).end()
      return
    }
    try {
      const user = await User.findOne({ email })
      if (!user) {
        res.status(404).end()
        return
      } else {
        const payload = { id: user.id }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        const transporter = await nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
          }
        })
        let options = {
          from: 'triptrip.official@gmail.com',
          to: email,
          subject: 'TripTrip 重設您的密碼',
          html: `<h2>點選以下的網址來重設您的密碼</h2>
                <a href="http://localhost:3000/users/validate_reset">重設密碼</a>
                <p> TripTrip 管理團隊</p>`
        }
        transporter.sendMail(options).then(info => {
          console.log(info.response)
        }).catch(error => console.log(error))
        res.cookie('forgot_password', token, {
          expires: new Date(Date.now() + 1000 * 60 * 5),
          httpOnly: true
        })
        res.status(200).end()
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async validateReset (req, res) {
    res.status(200).end()
  },
  async resetPassword (req, res) {
    const { password } = req.body
    if (!password) {
      res.status(400).end()
      return
    }
    try {
      const user = await User.findById(req.resetId)
      if (!user) {
        res.status(404).end()
        return
      } else {
        user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        user.save()
        res.status(200).end()
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }
}

module.exports = userController

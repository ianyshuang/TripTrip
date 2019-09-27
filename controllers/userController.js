const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Trip = require('../models/trip')
const Site = require('../models/site')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const imgur = require('imgur')

const userController = {
  async signup (req, res) {
    const { email, password, username } = req.body
    if (!email || !password || !username) {
      res.status(400).send('請填入所有資訊！')
      return
    }
    try {
      const user = await User.findOne({ email })
      if (user) {
        res.status(409).send({ message: '此 email 已被註冊過！' })
      } else {
        const newUser = await User.create({
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
          username
        })
        delete newUser.password
        const payload = { id: newUser.id }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        res.cookie('token', token, {
          expires: new Date(Date.now() + 1000 * 3600 * 24),
          httpOnly: true
        })
        res.status(201).send(newUser)
      }
    } catch (error) {
      console.log(error)
      res.status(500).send()
    }
  },
  async getUser (req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password')
      if (!user) {
        res.status(404).end()
        return
      }
      res.status(200).send(user)
    } catch (error) {
      console.log(error)
      res.status(500)
    }
  },
  async getProfileById (req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password')
      if (!user) {
        res.status(404).end()
        return
      } else {
        const data = { ...user._doc }
        ratingTripsId = data.ratingTrips.map(trip => trip.id)
        data.collectingTrips = await Trip.find({ id: { $in: data.collectingTrips } })
        data.collectingSites = await Site.find({ placeId: { $in: data.collectingSites } })
        data.owningTrips = await Trip.find({ userId: user.id })
        data.ratingTrips = await Trip.find({ id: { $in: ratingTripsId } })
        res.status(200).send(data)
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getUserById (req, res) {
    try {
      const user = await User.findById(req.params.id).select('-password ')
      if (!user) {
        res.status(404).end()
        return
      }
      res.status(200).send(user)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async editProfile (req, res) {
    const text = JSON.parse(JSON.stringify(req.body))
    const file = req.file
    const { username, password, introduction } = text
    let imgurObject = null
    if (file) {
      try {
        imgur.setClientId(process.env.IMGUR_ID)
        imgurObject = await imgur.uploadFile(file.path)
      } catch (error) {
        console.log(error)
        res.status(500).end()
        return
      }
    }
    try {
      const user = await User.findById(req.user.id)
      user.username = username || user.username
      user.password = password
        ? bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        : user.password
      user.introduction = introduction || user.introduction
      user.avatar = file ? imgurObject.data.link : user.avatar
      user.save()
      res.status(200).send(user)
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
        const randomCode = Math.random()
          .toString(36)
          .slice(-20)
        const options = {
          from: 'triptrip.official@gmail.com',
          to: email,
          subject: 'TripTrip 重設您的密碼',
          html: `<h2>點選以下的網址來重設您的密碼</h2>
                <a href="https://triptrip-backend.herokuapp.com/users/validate_reset/${randomCode}">重設密碼</a>
                <p> TripTrip 管理團隊</p>`
        }
        transporter
          .sendMail(options)
          .then(info => {
            console.log(info.response)
          })
          .catch(error => console.log(error))
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
  },
  async getUsers (req, res) {
    try {
      const users = await User.find({})
      const data = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        collectingTrips: user.collectingTrips.length,
        collectedTrips: user.collectedTrips.length
      }))
      res.status(200).send(data)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async deleteUser (req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      if (!user) {
        res.status(404).end()
        return
      }
      await Trip.deleteMany({ userId: user.id }) // 將該使用者的行程刪除
      // 從所有該使用者收藏行程中的 collectingUsers 中將其 userId 刪除
      const trips = await Trip.find({ collectingUsers: user.id })
      if (trips.length !== 0) {
        trips.forEach(trip => {
          trip.collectingCounts -= 1
          const index = trip.collectingUsers.findIndex(id => id === user.id)
          trip.collectingUsers.splice(index, 1)
          trip.save()
        })
      }
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  deleteToken (req, res) {
    try {
      res.clearCookie('token')
      res.status(200).end()
    } catch (error) {
      res.status(500).end()
    }
  }
}

module.exports = userController

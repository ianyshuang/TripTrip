const jwt = require('jsonwebtoken')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const userController = {
  signin (req, res) {
    const payload = { id: req.user.id }
    const token = jwt.sign(payload, process.env.JWT_SECRET)
    res.cookie('token', token, {
      expires: new Date(Date.now() + 1000 * 3600 * 24),
      httpOnly: true
    })
    res.status(200).send(token)
  },
  sinup (req, res) {
    const { email, password, firstName, lastName } = req.body
    if (!email || !password) {
      return res.status(400).send('email or password cannot be null!')
    }
    User.findOne({ email })
      .then(user => {
        if (user) return res.status(403).send({ message: '此 email 已被註冊過!'})
        return User.create({
          email,
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null),
          firstName: firstName ? firstName : ' ',
          lastName: lastName ? lastName : ' '
        }).then(user => res.status(201).send({ message: '成功註冊!'}))
      }).catch(error => console.log(error))
  }
}

module.exports = userController
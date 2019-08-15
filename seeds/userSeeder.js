const mongoose = require('mongoose')
const User = require('../models/user')
const userData = require('../data/user.json')
const bcrypt = require('bcrypt')

mongoose.connect('mongodb://localhost/trip-planer', { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
})

const users = userData.data.map(user => ({
  ...user,
  password: bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null)
}))

User.insertMany(users).then(users => {
  console.log('successfully writing seed data')
}).catch(error => {
  console.log(error)
})
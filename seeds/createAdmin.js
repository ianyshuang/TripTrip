const mongoose = require('mongoose')
const User = require('../models/user')
const readline = require('readline')
const crypto = require('crypto')
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'

mongoose.connect(dbpath, { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  let username = ''
  let email = ''
  let password = ''
  console.log('success:: connected to mongodb!')
  const rl = readline.createInterface(process.stdin, process.stdout)
  console.log('Please enter the following informatino to create an admin account')
  rl.question('Username: ', (input) => {
    username = input
    rl.question('Email: ', (input) => {
      email = input
       rl.question('Password: ', input => {
         password = input
         rl.close()
       })
    })
  })
  rl.on('close', () => {
    User.create({
      username: username,
      email: email,
      password: crypto.createHash('md5').update(password, 'utf-8').digest('hex'),
      isAdmin: true
    }).then(() => {
      console.log('succefully create admin user!')
      process.exit(0)
    }).catch(error => {
      console.log(error)
    })
  })
})
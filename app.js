// 載入套件及初始設定
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')
// 跟 mongodb 連線
mongoose.connect('mongodb://localhost/trip-planer', { useNewUrlParser: true })
const db = mongoose.connection

// 載入 Model
const User = require('./models/user')

// 使用設定
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(cookieParser())

db.on('error', () => {
  console.log('failed to connect to mongodb!')
})

db.once('open', () => {
  console.log('successfully connected to mongodb!')
})

app.use('/', require('./routes'))

app.listen(port, () => {
  console.log(`Server is now running on http://localhost:${port}`)
})
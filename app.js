// 載入套件及初始設定
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 3000
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const passport = require('./config/passport')
// 跟 mongodb 連線
mongoose.connect(dbpath, { useNewUrlParser: true, useCreateIndex: true })
const db = mongoose.connection

// 使用設定
app.use(bodyParser.json())
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

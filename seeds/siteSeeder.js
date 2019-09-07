const mongoose = require('mongoose')
const Site = require('../models/site')
const User = require('../models/user')
const siteData = require('../data/site.json')
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'

mongoose.connect(dbpath, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
})

const sites = siteData.data.map(site => ({
  name: site.name,
  placeId: site.placeId
}))

Site.insertMany(sites)
  .then(() => {
    console.log('successfully writing seed data')
  })
  .catch(error => {
    console.log(error)
  })
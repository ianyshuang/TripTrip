const mongoose = require('mongoose')
const Site = require('../models/site')
const siteData = require('../data/site.json')['data']
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'

mongoose.connect(dbpath, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
  db.dropCollection('sites')
    .then(() => {
      console.log('successfully dropping sites collection')
      const sites = siteData.map(site => ({
        name: site.name,
        placeId: site.placeId,
        formatted_address: site.formatted_address
      }))
      Site.insertMany(sites)
        .then(() => {
          console.log('successfully writing seed data')
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log('fail to drop sites collection')
    })
})




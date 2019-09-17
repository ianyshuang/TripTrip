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
      // add city and village to site
      for (const site of siteData) {
        site.city = ''
        site.village = ''
        for (const component of site.address_components) {
          if (component.types.includes('administrative_area_level_3')) {
            site.village = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            site.city = component.long_name
            break
          } else if (component.types.includes('administrative_area_level_2')) {
            site.city = component.long_name
          }
        }
      }
      // wrapping into an object
      const sites = siteData.map(site => ({
        name: site.name,
        placeId: site.placeId,
        address: site.formatted_address,
        city: site.city,
        village: site.village
      }))
      // insert to db
      Site.insertMany(sites)
        .then(() => {
          console.log('successfully writing seed data')
        })
        .catch(error => {
          console.log(error)
        })
    })
    .catch(error => {
      console.log(error)
      console.log('fail to drop sites collection')
    })
})

const Site = require('../models/site')
const User = require('../models/user')
const MongoClient = require('mongodb').MongoClient
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost'

const siteController = {
  async getSitesByKeyword (req, res) {
    const { keyword } = req.query
    const regex = new RegExp(keyword, 'i')
    try {
      const sites = await Site.find({
        name: { $regex: regex }
      }).sort({ collectingCounts: -1 })
      res.status(200).send(sites)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getPopularSites (req, res) {
    try {
      const sites = await Site.find({}).sort({ collectingCounts: -1 })
      const popularSites = sites.slice(0, 4)
      res.status(200).send(popularSites)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getSitesByCountryAndCities (req, res) {
    const { cities, country } = req.query
    if (cities) {
      const regexArray = []
      for (const city of cities) {
        regexArray.push(new RegExp(city, 'i'))
      }
      try {
        const sites = await Site.find({
          city: { $in: regexArray }
        }).sort({ collectingCounts: -1 })
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    } else if (country) {
      try {
        const regex = new RegExp(country, 'i')
        const sites = await Site.find({
          address: { $regex: regex }
        })
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    } else {
      try {
        const sites = await Site.find({})
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    }
  },
  async getSite (req, res) {
    try {
      const site = await Site.findOne({ placeId: req.params.placeId })
      if (!site) {
        res.status(404).end()
        return
      }
      const client = await MongoClient.connect(dbpath, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      const dbName = process.env.MONGODB_URI ? 'heroku_2g6t7nh8' : 'trip-planer'
      const db = client.db(dbName)
      const containingTrips = await db
        .collection('trips')
        .find({
          sites: { $elemMatch: { $elemMatch: { $in: [site.name] } } }
        })
        .sort({ collectingCounts: -1 })
        .toArray()
      if (containingTrips.length !== 0) {
        res.status(200).send({ site, containingTrips })
      } else {
        const otherSites = []
        const sameCitySites = await Site.find({ city: site.city }).sort({ collectingCounts: -1 }) // 將同縣市的景點找出並依收藏數排序
        sameCitySites.forEach(site => {
          if (site.placeId !== req.params.placeId) otherSites.push(site._doc.name) // 將景點名稱放到 otherSites 裡面
        })
        const otherTrips = []
        // 當行程少於三個，就一直用這些同縣市的景點去找行程
        for (let site of otherSites) {
          if (otherTrips.length < 3) {
            let trips = await db
              .collection('trips')
              .find({
                sites: { $elemMatch: { $elemMatch: { $in: [site] } } }
              })
              .toArray()
            trips.forEach(trip => {
              otherTrips.push({
                ...trip,
                site: site
              })
            })
          }
        }
        res.status(200).send({ site, otherTrips })
      }
      client.close()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async toggleCollectingSite (req, res) {
    try {
      const site = await Site.findOne({ placeId: req.params.placeId })
      const user = await User.findById(req.user._id)
      if (!site) {
        res.status(404).end()
        return
      }
      if (site.collectingUsers.includes(user.id)) {
        const userIndex = site.collectingUsers.findIndex(id => id === user.id)
        const siteIndex = user.collectingSites.findIndex(id => id === site.placeId)
        site.collectingUsers.splice(userIndex, 1)
        site.collectingCounts -= 1
        user.collectingSites.splice(siteIndex, 1)
      } else {
        site.collectingCounts += 1
        site.collectingUsers.push(user.id)
        user.collectingSites.push(site.placeId)
      }
      site.markModified('collectingUsers')
      user.markModified('collectingSites')
      site.save()
      user.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getSites (req, res) {
    try {
      const sites = await Site.find({})
      res.status(200).send(sites)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async deleteSite (req, res) {
    try {
      const site = await Site.findOneAndDelete({ placeId: req.params.id })
      if (!site) {
        res.status(404).end()
      } else {
        res.status(200).end()
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }
}

module.exports = siteController

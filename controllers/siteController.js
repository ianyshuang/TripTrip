const Site = require('../models/site')
const User = require('../models/user')
const Trip = require('../models/trip')
const MongoClient = require('mongodb').MongoClient
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost'

const siteController = {
  async getSitesByKeyword(req, res) {
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
  async getPopularSites(req, res) {
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
    let { cities, country } = req.query
    if (cities) {
      let regexArray = cities.map(city => {
        return new RegExp(city, 'i')
      })
      try {
        const sites = await Site.find({
          formatted_address: { $in: regexArray }
        })
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    } else if (country) {
      try {
        let regex = new RegExp(country, 'i')
        const sites = await Site.find({
          formatted_address: { $regex: regex }
        })
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    } else {
      try {
        const sites = await Site.find({})
        res.status(200).send(sites)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    }
  },
  async getSite(req, res) {
    try {
      const site = await Site.findOne({ placeId: req.params.id })
      if (!site) {
        res.status(404).end()
        return
      }
      const client = await MongoClient.connect(dbpath, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      const db = client.db('trip-planer')
      const trips = await db
        .collection('trips')
        .find({
          sites: { $elemMatch: { $elemMatch: { $in: [site.name] } } }
        })
        .sort({ collectingCounts: -1 })
        .toArray()
      res.status(200).send({ site, trips })
      client.close()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async toggleCollectingSite (req, res) {
    try {
      const site = await Site.findOne({ placeId: req.params.id})
      const user = await User.findById(req.user.id)

      if (site.collectingUsers.includes(user.id)) {
        const userIndex = site.collectingUsers.findIndex(id => id === user.id)
        const siteIndex = user.collectedSites.findIndex(id => id === site.placeId)
        site.collectingUsers.splice(userIndex, 1)
        site.collectingCounts -= 1
        user.collectedSites.splice(siteIndex, 1)
      } else {
        site.collectingCounts += 1
        site.collectingUsers.push(user.id)
        user.collectedSites.push(site.placeId)
      }
      site.markModified('collectingUsers')
      user.markModified('collectedSites')
      site.save()
      user.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }
}

module.exports = siteController

const express = require('express')
const router = express.Router()
const siteController = require('../controllers/siteController')
const passport = require('passport')

const authencitcated = passport.authenticate('jwt', { session: false })
router.get('/', siteController.getSitesByCountryAndCities)
router.get('/search', siteController.getSitesByKeyword)
router.get('/popular', siteController.getPopularSites)
router.get('/:placeId', siteController.getSite)
router.patch('/:placeId/collect', authencitcated, siteController.toggleCollectingSite)

module.exports = router

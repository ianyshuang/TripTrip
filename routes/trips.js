const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const tripController = require('../controllers/tripController')
const multer = require('multer')
const upload = multer({ dest: '/tmp/' })
const authenticated = passport.authenticate('jwt', { session: false })

router
  .route('/')
  .get(tripController.getTripByCountryAndCities)
  .post(authenticated, upload.array('images'), tripController.createTrip)

router.get('/search', tripController.getTripsByKeyword)
router.get('/popular', tripController.getPopularTrips)

router
  .route('/:id')
  .get(tripController.getTrip)
  .patch(authenticated, upload.array('images'), tripController.updateTrip)
  .delete(authenticated, tripController.deleteTrip)

router.patch('/:id/collect', authenticated, tripController.toggleCollectingTrip)
router.post('/:id/fork', authenticated, tripController.forkTrip)
router.patch('/:id/rate', authenticated, tripController.rateTrip)
router.patch('/:id/comment', authenticated, tripController.handleTripComment)
router.patch('/:id/:commentId/reply', authenticated, tripController.handleTripReply)

module.exports = router

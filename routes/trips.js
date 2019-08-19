const express = require('express')
const router = express.Router()
const passport = require('passport')
const tripController = require('../controllers/tripController')

const authenticated = passport.authenticate('jwt', { session: false })

router
  .route('/')
  .get(tripController.getTrips)
  .post(authenticated, tripController.createTrip)

router
  .route('/:id')
  .get(tripController.getTrip)
  .patch(authenticated, tripController.updateTrip)
  .delete(authenticated, tripController.deleteTrip)

router.get('/popular', tripController.getPopularTrips)
router.patch('/:id/collect', authenticated, tripController.toggleCollectingTrip)
router.post('/:id/fork', authenticated, tripController.forkTrip)
router.patch('/:id/rate', authenticated, tripController.rateTrip)
router.patch('/:id/comment', authenticated, tripController.handleTripComment)
router.patch('/:id/:commentId/reply', authenticated, tripController.handleTripReply)

module.exports = router

const express = require('express')
const router = express.Router()
const siteController = require('../controllers/siteController')
const passport = require('passport')

const authencitcated = passport.authenticate('jwt', { session: false })

router.get('/popular', authencitcated, siteController.getPopularSites)

router
  .route('/:id')
  .get(authencitcated, siteController.getSite)
  .patch(authencitcated, siteController.toggleCollectingSite)

router.patch('/:id/comment', authencitcated, siteController.handleComment)

router.patch('/:id/:commentId/reply', authencitcated, siteController.handleReply)

module.exports = router
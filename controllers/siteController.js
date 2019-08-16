const Site = require('../models/site')
const User = require('../models/user')

const siteController = {
  getPopularSites (req, res) {
    Site.find({}).sort({
      collectingCounts: 'desc'
    }).then(sites => {
      const popularSites = sites.slice(0, 4)
      res.status(200).send(popularSites)
    }).catch(error => {
      console.log(error)
      res.status(404).end()
    })
  },
  getSite (req, res) {
    Site.findById(req.params.id).then(site => {
      res.status(200).send(site)
    }).catch(error => {
      console.log(error)
      res.status(404).end()
    })
  },
  async toggleCollectingSite (req, res) {
    try {
      const site = await Site.findById(req.params.id)
      const user = await User.findById(req.user.id)

      if (site.collectingUsers.includes(user.id)) {
        const userIndex = site.collectingUsers.findIndex(id => id === user.id)
        const siteIndex = user.collectedSites.findIndex(id => id === site.id)
        site.collectingUsers.splice(userIndex, 1)
        user.collectedSites.splice(siteIndex, 1)
      } else {
        site.collectingUsers.push(user.id)
        user.collectedSites.push(site.id)
      }
      site.save()
      user.save()
      
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleComment (req, res) {
    if (req.body.text) {
      try {
        const site = await Site.findById(req.params.id)
        const newComment = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.lastName + ' ' + req.user.firstName,
          text: req.body.text
        }
        site.comments.push(newComment)
        site.save()
        res.status(200).send(newComment)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    } else if (req.body.commentId) {
      try {
        const site = await Site.findById(req.params.id)
        const commentIndex = site.comments.findIndex(comment => comment.id === req.body.commentId)
        site.comments.splice(commentIndex, 1)
        site.save()
        res.status(200).end()
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    } else {
      res.status(400).send('未攜帶正確資訊！')
    }
  },
  async handleReply (req, res) {
    if (req.body.text) {
      try {
        const site = await Site.findById(req.params.id)
        const comment = site.comments.find(comment => comment.id === req.params.commentId)
        const newReply = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.lastName + ' ' + req.user.firstName,
          text: req.body.text
        }
        if (!comment.replies) {
          comment.replies = []
        }
        comment.replies.push(newReply)
        site.markModified('comments') // mixed type 要告訴 mongoose 是哪個屬性修改了，否則不會更新
        site.save()
        res.status(200).send(newReply)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
      
    } else if (req.body.replyId) {
      try {
        const site = await Site.findById(req.params.id)
        const comment = site.comments.find(comment => comment.id === req.params.commentId)
        const replyIndex = comment.replies.findIndex(reply => reply.id === req.body.replyId)
        comment.replies.splice(replyIndex, 1)
        console.log(comment)
        site.markModified('comments') // mixed type 要告訴 mongoose 是哪個屬性修改了，否則不會更新
        site.save()
        res.status(200).end()
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    } else {
      res.status(400).send('未攜帶正確資訊！')
    }
  }

}

module.exports = siteController
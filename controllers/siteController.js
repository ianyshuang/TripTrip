const Site = require('../models/site')
const User = require('../models/user')

const siteController = {
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
  async getSite (req, res) {
    try {
      const site = await Site.findById(req.params.id)
      res.status(200).send(site)
    } catch (error) {
      console.log(error)
      res.status(404).end()
    }
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
      site.markModified('collectingUsers')
      user.markModified('collectedSites')
      site.save()
      user.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleSiteComment (req, res) {
    const { text, commentId } = req.body
    let message = {}
    if (!text && !commentId) {
      res.status(400).send('未攜帶正確資訊！')
      return
    }
    try {
      const site = await Site.findById(req.params.id)
      if (!commentId) {
        const newComment = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.name,
          userAvatar: req.user.avatar,
          text: text
        }
        message = newComment
        site.comments.push(newComment)
      } else if (!text) {
        const commentIndex = site.comments.findIndex(comment => comment.id === commentId)
        if (commentIndex === -1) {
          res.status(404).end()
          return
        }
        site.comments.splice(commentIndex, 1)
      } else {
        const comment = site.comments.find(comment => comment.id === commentId)
        if (!comment) {
          res.status(404).end()
          return
        }
        comment.text = text
        comment.date = new Date()
      }
      site.markModified('comments')
      site.save()
      res.status(200).send(message)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleSiteReply (req, res) {
    const { text, replyId } = req.body
    let message = {}
    if (!text && !replyId) {
      res.status(404).send('未攜帶正確資訊！')
      return
    }
    try {
      const site = await Site.findById(req.params.id)
      const comment = site.comments.find(comment => comment.id === req.params.commentId)
      if (!replyId) {
        const newReply = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.name,
          userAvatar: req.user.avatar,
          text: req.body.text
        }
        message = newReply
        // 如果此則留言尚未有任何回覆
        if (!comment.replies) {
          comment.replies = []
        }
        comment.replies.push(newReply)
      } else if (!text) {
        const replyIndex = comment.replies.findIndex(reply => reply.id === replyId)
        if (replyIndex === -1) {
          res.status(404).end()
          return
        }
        comment.splice(replyIndex, 1)
      } else {
        const reply = comment.replies.find(reply => reply.id === replyId)
        if (!reply) {
          res.status(404).end()
          return
        }
        reply.text = text
        reply.date = new Date()
      }
      site.markModified('comments')
      site.save()
      res.status(200).send(message)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }
}

module.exports = siteController

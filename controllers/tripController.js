const Trip = require('../models/trip')
const User = require('../models/user')
const Site = require('../models/site')
const MongoClient = require('mongodb').MongoClient
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost'
const imgur = require('imgur')

async function uploadImages (paths) {
  const imgLinks = []
  for (const path of paths) {
    const result = await imgur.uploadFile(path)
    imgLinks.push(result.data.link)
  }
  return imgLinks
}

function sortCommentAndReply(trip) {
  trip.comments.sort((prev, next) => {
    return (new Date(next.date) - new Date(prev.date))
  })
  trip.comments.forEach(comment => {
    if (comment.replies) {
      comment.replies.sort((prev, next) => {
        return (new Date(next.date) - new Date(prev.date))
      })
    }
  })
}

const tripController = {
  async getPopularTrips(req, res) {
    try {
      const trips = await Trip.find({}).populate('userId', 'username').sort({ collectingCounts: -1 })
      const popularTrips = trips.slice(0, 4)
      res.status(200).send(popularTrips)
    } catch (error) {
      console.log(error)
      res.status(404).end()
    }
  },
  async getTrip(req, res) {
    try {
      const trip = await Trip.findById(req.params.id).populate('userId', 'username') // 用 userId 去 user 參照，並取回 username 這個欄位
      if (!trip) {
        res.status(404).end()
        return
      }
      sortCommentAndReply(trip) // 將 comment, reply 從最新排到最舊
      data = { ...trip._doc } // 原本的 trip 為 strict mode，不可刪除或添加屬性，必須建立一個新的 object
      data.username = trip.userId.username
      data.userId = trip.userId._id
      for (let content of data.contents) {
        for (let activity of content.activities) {
          if (activity.placeId) {
            const site = await Site.findOne({ placeId: activity.placeId })
            activity.collectingCounts = site.collectingCounts
          }
        }
      }
      res.status(200).send(data)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getTripByCountryAndCities(req, res) {
    const { cities, country } = req.query
    let trips = []
    try {
      if (cities && cities.length !== 0) {
        trips = await Trip.find({ cities: { $in: cities } }).populate('userId', 'username')
      } else if (country) {
        trips = await Trip.find({ country: country }).populate('userId', 'username')
      } else {
        trips = await Trip.find({}).populate('userId', 'username')
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
    trips.forEach(trip => {
      sortCommentAndReply(trip) // 將 comment, reply 從最新排到最舊
    })
    // 原本的 trips 為 strict mode，不可刪除或添加屬性，必須建立一個新的 object
    data = trips.map(trip => ({
      ...trip._doc,
      username: trip.userId.username,
      userId: trip.userId._id
    }))
    res.status(200).send(data)
  },
  async getTripsByKeyword(req, res) {
    let { keyword } = req.query
    if (keyword.includes('臺')) {
      keyword = keyword.replace('臺', '台')
    }
    const regex = new RegExp(keyword, 'i')
    try {
      const client = await MongoClient.connect(dbpath, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      const dbName = process.env.MONGODB_URI ? 'heroku_2g6t7nh8' : 'trip-planer'
      const db = client.db(dbName)
      const trips = await db
        .collection('trips')
        .find({
          $or: [
            { name: { $regex: regex } },
            {
              contents: {
                $elemMatch: {
                  activities: { $elemMatch: { name: { $regex: regex } } }
                }
              }
            },
            { sites: { $elemMatch: { $elemMatch: { $in: [regex] } } } },
            { country: keyword },
            { cities: keyword }
          ]
        })
        .sort({ rating: -1 })
        .toArray()
      trips.forEach(trip => {
        sortCommentAndReply(trip)
      })
      for (let trip of trips) {
        const user = await User.findById(String(trip.userId))
        trip.username = user.username
      }
      res.status(200).send(trips)
      client.close()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async createTrip(req, res) {
    const body = JSON.parse(JSON.stringify(req.body))
    const files = req.files
    const data = JSON.parse(body.data)
    if (!data.name) {
      res.status(400).send('請輸入行程名稱！')
      return
    }
    // 整理 data 格式 (Postman 才需要，axios 不用)
    // const activities = []
    // data.contents.forEach(content => {
    //   const array = content.activities.map(activity => JSON.parse(activity))
    //   activities.push(array)
    // })
    // for (let i = 0; i < data.contents.length; i++) {
    //   data.contents[i].activities = activities[i]
    // }
    // data.isPrivate = data.isPrivate === 'true'
    // 上傳圖片並得到回傳的URL
    let imgLinks = []
    if (files && files.length !== 0) {
      try {
        imgur.setClientId(process.env.IMGUR_ID)
        const filePaths = files.map(file => file.path)
        imgLinks = await uploadImages(filePaths)
      } catch (error) {
        console.log(error)
      }
    }
    // 新增行程
    try {
      const trip = await Trip.create({
        userId: req.user._id,
        days: data.contents.length,
        ...data,
        images: imgLinks,
        startDate: data.startDate ? new Date(data.startDate) : new Date()
      })
      res.status(200).send(trip)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async updateTrip(req, res) {
    const body = JSON.parse(JSON.stringify(req.body))
    const files = req.files
    const data = JSON.parse(body.data)
    const deletedImages = data.deletedImages || []
    delete data['deletedImages'] // 從 data 拿掉以免加進去原本 trip 的屬性

    // 整理 data 格式 (Postman 才需要，axios 不用)
    // if (data.sites) {
    //   const activities = []
    //   data.contents.forEach(content => {
    //     const array = content.activities.map(activity => JSON.parse(activity))
    //     activities.push(array)
    //   })
    //   for (let i = 0; i < data.contents.length; i++) {
    //     data.contents[i].activities = activities[i]
    //   }
    // }
    try {
      let trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      if (String(trip.userId) !== req.user.id) {
        res.status(403).end()
        return
      }
      // 上傳圖片並得到回傳的URL
      let imgLinks = []
      if (files && files.length !== 0) {
        try {
          imgur.setClientId(process.env.IMGUR_ID)
          const filePaths = files.map(file => file.path)
          imgLinks = await uploadImages(filePaths)
        } catch (error) {
          console.log(error)
          res.status(500).end()
        }
      }
      // 將屬性更新(剔除不可由 update 直接變更的屬性)
      const notEditableFields = ['days', 'rating', 'ratingCounts', 'images', 'collectingCounts', 'collectingUsers', '_id', 'userId', '__v', 'comments']
      for (let field of notEditableFields) {
        delete data[field]
      }
      Object.assign(trip, data)
      trip.days = trip.contents.length
      // 刪除舊圖片
      if (deletedImages.length !== 0) {
        deletedImages.forEach(image => {
          const index = trip.images.findIndex(url => url === image)
          if (index !== -1) {
            trip.images.splice(index, 1)
          }
        })
      }
      // 加入新圖片
      if (imgLinks.length !== 0) {
        imgLinks.forEach(link => {
          trip.images.push(link)
        })
      }
      // 完成修改
      trip.markModified('contents')
      trip.markModified('sites')
      trip.markModified('comments')
      await trip.save()
      res.status(200).send(trip)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async deleteTrip(req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      } else if (String(trip.userId) !== req.user.id) {
        res.status(403).end()
      } else {
        trip.remove()
        res.status(200).end()
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async toggleCollectingTrip(req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      const userCollecting = await User.findById(req.user._id)
      const userCollected = await User.findById(trip.userId)
      // trip 不存在
      if (!trip) {
        res.status(404).end()
        return
      }
      // 不可收藏自己的 trip
      if (String(trip.userId) === req.user.id) {
        res.status(403).end()
        return
      }
      // 以收藏則取消收藏，反之則加入收藏
      if (trip.collectingUsers.includes(req.user.id)) {
        const userCollectingIndex = trip.collectingUsers.findIndex(id => id === req.user.id)
        trip.collectingUsers.splice(userCollectingIndex, 1)
        trip.collectingCounts -= 1
        const tripCollectingIndex = userCollecting.collectingTrips.findIndex(id => id === trip.id)
        userCollecting.collectingTrips.splice(tripCollectingIndex, 1)
        const tripCollectedIndex = userCollected.collectedTrips.findIndex(id => id === trip.id)
        userCollected.collectedTrips.splice(tripCollectedIndex, 1)
      } else {
        trip.collectingUsers.push(req.user.id)
        trip.collectingCounts += 1
        userCollecting.collectingTrips.push(trip.id)
        userCollected.collectedTrips.push(trip.id)
      }
      // markModified 以儲存修改
      trip.markModified('collectingUsers')
      userCollecting.markModified('collectingTrips')
      userCollected.markModified('collectedTrips')
      trip.save()
      userCollecting.save()
      userCollected.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async forkTrip(req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      const { name, days, country, cities, contents, sites, startDate } = trip
      const newTrip = await Trip.create({
        userId: req.user._id,
        isPrivate: false,
        startDate,
        name,
        days,
        country,
        cities,
        contents,
        sites
      })
      res.status(200).send(newTrip)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async rateTrip(req, res) {
    const { rating } = req.body
    if (!rating) {
      res.status(400).send('未傳送評分！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      const user = await User.findById(req.user.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      if (String(trip.userId) === req.user.id) {
        res.status(403).end()
        return
      }
      const userRatingObject = user.ratingTrips.find(
        trip => trip.id === req.params.id
      )
      if (!userRatingObject) {
        trip.rating =
          (trip.rating * trip.ratingCounts + rating) / (trip.ratingCounts + 1)
        trip.ratingCounts += 1
        user.ratingTrips.push({
          id: req.params.id,
          userRating: rating
        })
      } else {
        trip.rating =
          (trip.rating * trip.ratingCounts - userRatingObject.rating + rating) /
          trip.ratingCounts
        userRatingObject.userRating = rating
      }
      user.markModified('ratingTrips')
      user.save()
      trip.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleTripComment(req, res) {
    const { text, commentId } = req.body
    let message = {}
    if (!text && !commentId) {
      res.status(400).send('未攜帶正確資訊！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).send('無此行程')
        return
      }
      if (!commentId) {
        const newComment = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user._id,
          username: req.user.username,
          userAvatar: req.user.avatar,
          text: text
        }
        message = newComment
        trip.comments.unshift(newComment)
      } else if (!text) {
        const commentIndex = trip.comments.findIndex(
          comment => comment.id === commentId
        )
        if (commentIndex === -1) {
          res.status(404).send('無此評論')
          return
        }
        trip.comments.splice(commentIndex, 1)
      } else {
        const comment = trip.comments.find(comment => comment.id === commentId)
        if (!comment) {
          res.status(404).send('無此評論')
          return
        }
        comment.text = text
        comment.date = new Date()
      }
      trip.markModified('comments')
      trip.save()
      res.status(200).send(message)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleTripReply(req, res) {
    const { text, replyId } = req.body
    let message = {}
    if (!text && !replyId) {
      res.status(404).send('未攜帶正確資訊！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      const comment = trip.comments.find(
        comment => comment.id === req.params.commentId
      )
      if (!trip) {
        res.status(404).send('無此行程')
        return
      }
      if (!comment) {
        res.status(404).send('無此評論')
        return
      }
      if (!replyId) {
        const newReply = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user._id,
          username: req.user.username,
          userAvatar: req.user.avatar,
          text: req.body.text
        }
        message = newReply
        // 如果此則留言尚未有任何回覆
        if (!comment.replies) {
          comment.replies = []
        }
        comment.replies.unshift(newReply)
      } else if (!text) {
        const replyIndex = comment.replies.findIndex(
          reply => reply.id === replyId
        )
        if (replyIndex === -1) {
          res.status(404).send('無此回覆')
          return
        }
        comment.replies.splice(replyIndex, 1)
      } else {
        const reply = comment.replies.find(reply => reply.id === replyId)
        if (!reply) {
          res.status(404).send('無此回覆')
          return
        }
        reply.text = text
        reply.date = new Date()
      }
      trip.markModified('comments')
      trip.save()
      res.status(200).send(message)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async adminDeleteTrip(req, res) {
    try {
      const trip = await Trip.findByIdAndDelete(req.params.id)
      if (!trip) {
        res.status(404).end()
      } else {
        res.status(200).end()
      }
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async getTrips(req, res) {
    try {
      const trips = await Trip.find({})
      res.status(200).send(trips)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  }
}

module.exports = tripController

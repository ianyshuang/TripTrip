const Trip = require('../models/trip')
const User = require('../models/user')
const MongoClient = require('mongodb').MongoClient
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost'
const imgur = require('imgur')

async function uploadImages(paths) {
  let imgLinks = []
  for (const path of paths) {
    const result = await imgur.uploadFile(path)
    imgLinks.push(result.data.link)
  }
  return imgLinks
}

const tripController = {
  async getPopularTrips (req, res) {
    try {
      const trips = await Trip.find({}).sort({ collectingCounts: 'desc' })
      const popularTrips = trips.slice(0, 4)
      res.status(200).send(popularTrips)
    } catch (error) {
      console.log(error)
      res.status(404).end()
    }
  },
  async getTrip (req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      res.status(200).send(trip)
    } catch (error) {
      console.log(error)
      res.status(404).end()
    }
  },
  async getTripByCountryAndCities (req, res) {
    let { cities, country } = req.query
    if (cities) {
      try {
        const trips = await Trip.find({
          cities: { $in: cities }
        })
        res.status(200).send(trips)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    } else if (country) {
      try {
        const trips = await Trip.find({
          country: country
        })
        res.status(200).send(trips)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    } else {
      try {
        const trips = await Trip.find({})
        res.status(200).send(trips)
      } catch (error) {
        console.log(error)
        res.status(404).end()
      }
    }
  },
  async getTripsByKeyword (req, res) {
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
      const db = client.db('trip-planer')
      const trips = await db
        .collection('trips')
        .find({
          $or: [
            { name: { $regex: regex } },
            { contents: { $elemMatch: { activities: { $elemMatch: { name: { $regex: regex } } } } } },
            { sites: { $elemMatch: { $elemMatch: { $in: [regex] } } } },
            { country: keyword },
            { cities: keyword }
          ]
        })
        .sort({ rating: -1 })
        .toArray()
      res.status(200).send(trips)
      client.close()
    } catch (error) {
      console.log(error)
      res.status(404).end()
    }
  },
  async createTrip (req, res) {
    const body = JSON.parse(JSON.stringify(req.body))
    const files = req.files
    const data = JSON.parse(body.data)
    if (!data.name || !data.sites || data.sites.length === 0) {
      res.status(400).send('請輸入行程名稱及景點！')
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
    if (files.length !== 0) {
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
        userId: req.user.id,
        days: data.sites.length,
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
  async updateTrip (req, res) {
    const body = JSON.parse(JSON.stringify(req.body))
    const files = req.files
    const data = JSON.parse(body.data)
    const deletedImages = data.deletedImages ? data.deletedImages : []
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

    // 上傳圖片並得到回傳的URL
    let imgLinks = []
    if (files.length !== 0) {
      try {
        imgur.setClientId(process.env.IMGUR_ID)
        const filePaths = files.map(file => file.path)
        imgLinks = await uploadImages(filePaths)
      } catch (error) {
        console.log(error)
        res.status(500).end()
      }
    }
    try {
      let trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      // 將除圖片外的所有屬性更新
      trip = Object.assign(trip, data)
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
      trip.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async deleteTrip (req, res) {
    try {
      const trip = await Trip.findByIdAndDelete(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async toggleCollectingTrip (req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      const user = await User.findById(req.user.id)
      if (trip.collectingUsers.includes(req.user.id)) {
        const userIdIndex = trip.collectingUsers.findIndex(
          id => id === req.user.id
        )
        trip.collectingUsers.splice(userIdIndex, 1)
        trip.collectingCounts -= 1
        const tripIdIndex = user.collectedTrips.findIndex(
          id => id === req.params.id
        )
        user.collectedTrips.splice(tripIdIndex, 1)
      } else {
        trip.collectingUsers.push(req.user.id)
        trip.collectingCounts += 1
        user.collectedTrips.push(req.params.id)
      }
      trip.markModified('collectingUsers')
      user.markModified('collectedTrips')
      trip.save()
      user.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async forkTrip (req, res) {
    try {
      const trip = await Trip.findById(req.params.id)
      if (!trip) {
        res.status(404).end()
        return
      }
      const { name, days, country, cities, startDate, contents, sites } = trip
      const newTrip = await Trip.create({
        userId: req.user.id,
        isPrivate: false,
        name,
        days,
        country,
        cities,
        startDate,
        contents,
        sites
      })
      res.status(200).send(newTrip)
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async rateTrip (req, res) {
    const { rating } = req.body
    if (!rating) {
      res.status(400).send('未傳送評分！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      const user = await User.findById(req.user.id)
      const userRatingObject = user.ratedTrips.find(
        trip => trip.id === req.params.id
      )
      if (!userRatingObject) {
        trip.rating = (trip.rating * trip.ratingCounts + rating) / (trip.ratingCounts + 1)
        trip.ratingCounts += 1
        user.ratedTrips.push({
          id: req.params.id,
          userRating: rating
        })
      } else {
        trip.rating =
          (trip.rating * trip.ratingCounts - userRatingObject.rating + rating) /
          trip.ratingCounts
        userRatingObject.userRating = rating
      }
      user.markModified('ratedTrips')
      user.save()
      trip.save()
      res.status(200).end()
    } catch (error) {
      console.log(error)
      res.status(500).end()
    }
  },
  async handleTripComment (req, res) {
    const { text, commentId } = req.body
    let message = {}
    if (!text && !commentId) {
      res.status(400).send('未攜帶正確資訊！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      if (!commentId) {
        const newComment = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.username,
          userAvatar: req.user.avatar,
          text: text
        }
        message = newComment
        trip.comments.push(newComment)
      } else if (!text) {
        const commentIndex = trip.comments.findIndex(comment => comment.id === commentId)
        if (commentIndex === -1) {
          res.status(404).end()
          return
        }
        trip.comments.splice(commentIndex, 1)
      } else {
        const comment = trip.comments.find(comment => comment.id === commentId)
        if (!comment) {
          res.status(404).end()
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
  async handleTripReply (req, res) {
    const { text, replyId } = req.body
    let message = {}
    if (!text && !replyId) {
      res.status(404).send('未攜帶正確資訊！')
      return
    }
    try {
      const trip = await Trip.findById(req.params.id)
      const comment = trip.comments.find(comment => comment.id === req.params.commentId)
      if (!replyId) {
        const newReply = {
          id: req.user.id + new Date().getTime(),
          date: new Date(),
          userId: req.user.id,
          userName: req.user.username,
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
        comment.replies.splice(replyIndex, 1)
      } else {
        const reply = comment.replies.find(reply => reply.id === replyId)
        if (!reply) {
          res.status(404).end()
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
  }
}

module.exports = tripController

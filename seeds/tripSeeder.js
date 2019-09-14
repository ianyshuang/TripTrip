const mongoose = require('mongoose')
const User = require('../models/user')
const Trip = require('../models/trip')
const tripData = require('../data/trip.json')
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'

mongoose.connect(dbpath, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
  db.dropCollection('trips')
    .then(() => {
      console.log('successfully dropping trips collection')
      User.find({}).then(users => {
        const trips = tripData.data.map(trip => {
          const index1 = Math.floor(Math.random() * 10)
          const index2 = Math.floor(Math.random() * 10)
          const index3 = Math.floor(Math.random() * 10)
          const index4 = Math.floor(Math.random() * 10)
          return {
            ...trip,
            userId: users[index1].id,
            comments: [
              {
                id:
                  users[index2].id + new Date(trip.comments[0].date).getTime(),
                date: trip.comments[0].date,
                text: trip.comments[0].text,
                userId: users[index2].id,
                userName: users[index2].username,
                replies: [
                  {
                    id:
                      users[index3].id +
                      new Date(trip.comments[0].replies[0].date).getTime(),
                    date: trip.comments[0].replies[0].date,
                    text: trip.comments[0].replies[0].text,
                    userId: users[index3].id,
                    userName: users[index3].username
                  }
                ]
              },
              {
                id:
                  users[index4].id + new Date(trip.comments[1].date).getTime(),
                date: trip.comments[1].date,
                text: trip.comments[1].text,
                userId: users[index4].id,
                userName: users[index4].username
              }
            ]
          }
        })
        Trip.insertMany(trips)
          .then(trips => {
            console.log('successfully writing seed data')
          })
          .catch(error => {
            console.log(error)
          })
      })
    })
    .catch(error => {
      console.log('fail to drop trips collection')
    })
})


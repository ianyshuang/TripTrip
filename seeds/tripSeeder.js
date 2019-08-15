const mongoose = require('mongoose')
const User = require('../models/user')
const Trip = require('../models/trip')
const tripData = require('../data/trip.json')

mongoose.connect('mongodb://localhost/trip-planer', { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
})

User.find({}).then(users => {
  const trips = tripData.data.map(trip => {
    const [index1, index2, index3, index4] = getRandomNonrepeatIndex()
    return {
      ...trip,
      userId: users[index1].id,
      comments: [
        {
          date: trip.comments[0].date,
          text: trip.comments[0].text,
          userId: users[index2].id,
          userName: users[index2].firstName + ' ' + users[index2].lastName,
          replies: [
            {
              date: trip.comments[0].replies[0].date,
              text: trip.comments[0].replies[0].text,
              userId: users[index3].id,
              userName:
                users[index3].firstName + ' ' + users[index3].lastName
            }
          ]
        },
        {
          date: trip.comments[0].date,
          text: trip.comments[0].text,
          userId: users[index4].id,
          userName: users[index4].firstName + ' ' + users[index4].lastName
        }
      ],
      collectingUsers: [
        users[index2].id,
        users[index3].id,
        users[index4].id
      ]
    }
  })
  Trip.insertMany(trips).then(trips => {
    console.log('successfully writing seed data')
  }).catch(error => {
    console.log(error)
  })
})

function getRandomNonrepeatIndex () {
  const source = Array.from(Array(10).keys())
  const result = []
  for (let i = 0; i < 4 ; i++) {
    const targetIndex = Math.floor(Math.random() * source.length)
    result.push(source[targetIndex])
    source.splice(targetIndex, 1)
  }
  return result
}
const mongoose = require('mongoose')
const Site = require('../models/site')
const User = require('../models/user')
const siteData = require('../data/site.json')

mongoose.connect('mongodb://localhost/trip-planer', { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('error:: failed to connect to mongodb.')
})

db.once('open', () => {
  console.log('success:: connected to mongodb!')
})

User.find({}).then(users => {
  const sites = siteData.data.map(site => {
    const index1 = Math.floor(Math.random() * 10)
    const index2 = Math.floor(Math.random() * 10)
    const index3 = Math.floor(Math.random() * 10)
    return {
      name: site.name,
      comments: [
        {
          userId: users[index1].id,
          userName: users[index1].lastName + ' ' + users[index1].firstName,
          text: site.comments[0].text,
          replies: [
            {
              userId: users[index2].id,
              userName:
                users[index2].lastName + ' ' + users[index2].firstName,
              text: site.comments[0].replies.text
            }
          ]
        },
        {
          userId: users[index3].id,
          userName: users[index3].lastName + ' ' + users[index3].firstName,
          text: site.comments[1].text
        }
      ],
      collectingUsers: [
        users[index1].id,
        users[index2].id,
        users[index3].id
      ]
    }
  })
  Site.insertMany(sites).then(sites => {
    console.log('successfully writing seed data')
  }).catch(error => {
    console.log(error)
  })
})


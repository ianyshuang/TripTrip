const mongoose = require('mongoose')
const Site = require('../models/site')
const User = require('../models/user')
const siteData = require('../data/site.json')
const dbpath = process.env.MONGODB_URI || 'mongodb://localhost/trip-planer'

mongoose.connect(dbpath, { useNewUrlParser: true })

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
          id: users[index1].id + new Date(site.comments[0].date).getTime(),
          date: site.comments[0].date,
          userId: users[index1].id,
          userName: users[index1].lastName + ' ' + users[index1].firstName,
          text: site.comments[0].text,
          replies: [
            {
              id: users[index2].id + new Date(site.comments[0].replies[0].date).getTime(),
              date: site.comments[0].replies[0].date,
              userId: users[index2].id,
              userName:
                users[index2].lastName + ' ' + users[index2].firstName,
              text: site.comments[0].replies[0].text
            }
          ]
        },
        {
          id: users[index3].id + new Date(site.comments[1].date).getTime(),
          date: site.comments[1].date,
          userId: users[index3].id,
          userName: users[index3].lastName + ' ' + users[index3].firstName,
          text: site.comments[1].text
        }
      ]
    }
  })
  Site.insertMany(sites).then(sites => {
    console.log('successfully writing seed data')
  }).catch(error => {
    console.log(error)
  })
})

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const siteSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  placeId: {
    type: String,
    required: true
  },
  collectingCounts: {
    type: Number,
    default: 0
  },
  collectingUsers: {
    type: [Schema.Types.ObjectId],
    default: []
  }
}, { minimize: false })

module.exports = mongoose.model('Site', siteSchema)

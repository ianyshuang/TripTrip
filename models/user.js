const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    introduction: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: null
    },
    ownedTrips: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    collectedTrips: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    collectedSites: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    ratedTrips: {
      type: Schema.Types.Mixed,
      default: []
    }
  },
  { minimize: false }
)

module.exports = mongoose.model('User', userSchema)

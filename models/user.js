const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema(
  {
    username: {
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
    accountType: {
      type: String,
      default: 'local'
    },
    avatar: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    owningTrips: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    collectedTrips: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    collectingTrips: {
      type: [Schema.Types.ObjectId],
      default: []
    },
    collectingSites: {
      type: [String],
      default: []
    },
    ratingTrips: {
      type: Schema.Types.Mixed,
      default: []
    }
  },
  { minimize: false }
)

module.exports = mongoose.model('User', userSchema)

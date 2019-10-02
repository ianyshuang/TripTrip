const mongoose = require('mongoose')
const Schema = mongoose.Schema
const User = require('./user')
const tripSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: User,
    index: true,
    required: true
  },
  days: {
    type: Number,
    default: 1
  },
  country: {
    type: String,
    default: ''
  },
  cities: {
    type: [String],
    default: []
  },
  startDate: {
    type: Date
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  journal: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCounts: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  collectingCounts: {
    type: Number,
    default: 0
  },
  collectingUsers: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  sites: {
    type: Schema.Types.Mixed,
    default: []
  },
  contents: {
    type: Schema.Types.Mixed,
    default: []
  },
  comments: {
    type: Schema.Types.Mixed,
    default: []
  }
}, { minimize: false })

module.exports = mongoose.model('Trip', tripSchema)

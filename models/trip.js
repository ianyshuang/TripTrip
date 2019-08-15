const mongoose = require('mongoose')
const Schema = mongoose.Schema
const tripSchema = new Schema({
 name: {
   type: String,
   required: true
 },
 userId: {
   type: Schema.Types.ObjectId,
   ref: 'Users',
   index: true,
   required: true
 },
 days: {
   type: Number,
   required: true
 },
 country: {
   type: String,
   required: true
 },
 cities: {
   type: [String],
   default: []
 },
 startDate: {
   type: Date,
   required: true
 },
 isPrivate: {
   type: Boolean,
   default: false
 },
 journal: {
   type: String,
   default: ''
 },
  images: {
   type: [Schema.Types.ObjectId],
   default: []
 },
 collectingUsers: {
   type: [Schema.Types.ObjectId],
   default: []
 },
 content: {
   type: Schema.Types.Mixed,
   default: []
 },
 sites: {
   type: Schema.Types.Mixed,
   default: []
 },
 comments: {
   type: Schema.Types.Mixed,
   default: []
 }
}, { minimize: false })

module.exports = mongoose.model('Trip', tripSchema)
const chai = require('chai')
const assert = chai.assert
const Trip = require('../../models/trip')
const User = require('../../models/user')

describe('Trip Model Tests', () => {
  let testUser = null
  let data = null

  // 在測試開始前和結束後清空資料庫
  before(async () => {
    // await Trip.deleteMany({})
    const user = await User.create({
      email: 'test@example.com',
      username: 'testuser',
      password: 'test'
    })
    testUser = user
  })
  after(async () => {
    await Trip.deleteMany({})
    await User.findByIdAndDelete(data.userId)
  })

  describe('Creating Documents', () => {
    it('# Create a Trip', (done) => {
      Trip.create({
        name: '測試之旅',
        userId: testUser._id
      }).then(trip => {
        data = trip
        assert.isNotNull(trip, 'expect trip should not be null')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Reading Documents', () => {
    it('# Read a Trip', (done) => {
      Trip.findById(data._id).then(trip => {
        assert.equal(data.name, trip.name, 'expect name should be the same')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Updating Documents', () => {
    it('# Update a Trip', (done) => {
      Trip.findById(data._id).then(trip => {
        trip.name = '測試之旅2'
        return trip.save()
      }).then(trip => {
        assert.notEqual(data.name, trip.name, 'expect name should not be the same after updating')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Deleting Documents', () => {
    it('# Delete a Trip', (done) => {
      Trip.findByIdAndDelete(data._id).then(() => {
        Trip.findById(data._id).then(trip => {
          assert.isNull(trip, 'expect trip should be null after deleting')
          done()
        })
      }).catch(error => done(error))
    })
  })
})
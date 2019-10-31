const chai = require('chai')
const assert = chai.assert
const User = require('../../models/user')

describe('User Model Tests', () => {
  // 在測試開始前和結束後清空資料庫
  before(async () => {
    await User.deleteMany({})
  })
  after(async () => {
    await User.deleteMany({})
  })

  let data = null

  describe('Creating Documents', () => {
    it('# Create a User', (done) => {
      let randomPassword = Math.random().toString(36).slice(-8)
      User.create({
        email: 'test@example.com',
        username: 'testuser',
        password: randomPassword
      }).then(user => {
        if (user) {
          data = user
          assert.isNotNull(user)
          done()
        }
      }).catch(error => done(error))
    })
  })
  
  describe('Reading Documents', () => {
    it('# Read a User', (done) => {
      User.findById(data._id).then(user => {
        assert.equal(data.email, user.email, 'expext email should be the same')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Updating Documents', () => {
    it('# Update a User', (done) => {
      User.findById(data._id).then(user => {
        user.username = 'update'
        return user.save()
      }).then(user => {
        assert.notEqual(data.username, user.username, 'expect username should not be equal after updating')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Deleting Documents', () => {
    it('# Delete a User', (done) => {
      User.findByIdAndDelete(data._id).then(() => {
        User.findById(data._id).then(user => {
          assert.isNull(user, 'expect user to be null')
          done()
        })
      }).catch(error => done(error))
    })
  })
})
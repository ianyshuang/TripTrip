const chai = require('chai')
const assert = chai.assert
const Site = require('../../models/site')

describe('Site Model Tests', () => {
  // 在測試開始前和結束後清空資料庫
  before(async () => {
    await Site.deleteMany({})
  })
  after(async () => {
    await Site.deleteMany({})
  })

  let data = null

  describe('Creating Documents', () => {
    it ('# Create a Site', (done) => {
      Site.create({
        name: '藍晒圖文創園區',
        placeId: 'ChIJtbdB0Xt2bjQR1IE4qcWD',
        address: '702台灣台南市中西區西門路一段689巷'
      }).then(site => {
        data = site
        assert.isNotNull(site)
        done()
      }).catch(error => done(error))
    })
  })

  describe('Reading Documents', () => {
    it('# Read a Site', (done) => {
      Site.findById(data._id).then(site => {
        assert.equal(data.name, site.name, 'expect name should be equal')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Updating Documents', () => {
    it('# Update a Site', (done) => {
      Site.findById(data._id).then(site => {
        site.name = '台北101'
        return site.save()
      }).then(site => {
        assert.notEqual(data.name, site.name, 'expect name should not be equal after updating')
        done()
      }).catch(error => done(error))
    })
  })

  describe('Deleting Documents', () => {
    it('# Delete a Site', (done) => {
      Site.findByIdAndDelete(data._id).then(() => {
        Site.findById(data._id).then(user => {
          assert.isNull(user, 'expect site to be null after deleting')
          done()
        })
      }).catch(error => done(error))
    })
  })
})
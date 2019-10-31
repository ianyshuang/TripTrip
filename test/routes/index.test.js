const chai = require('chai')
const expect = chai.expect
const request = require('supertest')

const User = require('../../models/user')
const app = require('../../app').app

describe('User Controller APIs', () => {
  let newUser = null
  let token = null

  before(async () => {
    await User.deleteMany({})
  })

  describe('/signup', () => {

    it('O 成功註冊', (done) => {
      request(app)
        .post('/signup')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'test'
        })
        .expect(201)
        .then(response => {
          return User.findById(response.body._id)
        }).then(user => {
          newUser = { ...user._doc }
          expect(user.email).to.be.equal('test@example.com', 'email should be the same')
          done()
        }).catch(error => done(error))
    })

    it('X 信箱重複註冊', (done) => {
      request(app)
        .post('/signup')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'test'
        })
        .expect(409)
        .then(response => {
          expect(response.body.message).to.be.equal('此 email 已被註冊過！')
          done()
        }).catch(error => done(error))
    })
  })

  describe('/signin', () => {
    it('O 成功登入', (done) => {
      request(app)
        .post('/signin')
        .send({
          email: newUser.email,
          password: 'test'
        })
        .expect(200)
        .then(response => {
          let cookieString = response.header['set-cookie'][0]
          let tokenIndex = cookieString.indexOf('token')
          let semicolonIndex = cookieString.indexOf(';', tokenIndex)
          let jwt = cookieString.slice(tokenIndex + 6, semicolonIndex)
          token = jwt
          expect(String(response.body._id)).to.be.equal(String(newUser._id), 'Response UserId should be equal to newUser Id')
          done()
        }).catch(error => done(error))
    })

    it('X 密碼錯誤', (done) => {
      request(app)
        .post('/signin')
        .send({
          email: newUser.email,
          password: 'wrong'
        })
        .expect(422, done)
    })

    it('X 尚未註冊', (done) => {
      request(app)
        .post('/signin')
        .send({
          email: 'notregister@example.com',
          password: 'notregister'
        })
        .expect(404, done)
    })
  })

  describe('/logout', () => {
    it('O 成功登出', (done) => {
      request(app)
        .post('/logout')
        .set('Cookie', [`token=${token}`])
        .then(response => {
          expect(response.status).to.be.equal(200, 'status code should be equal to 200')
          done()
        })
    })
  })
})
const path = require('path')
const assert = require('assert')
const request = require('supertest')
const app = require('../app')
const User = require('../lib/mongo').User

const testName1 = 'testName1'
const testName2 = 'nswbmw'
const testEmail1 = 'test1@email.com'
const testEmail2 = 'test2@email.com'

describe('signup', function () {
  describe('POST /signup', function () {
    const agent = request.agent(app)// persist cookie when redirect
    beforeEach(function (done) {
      // 创建一个用户
      User.create({
        email: testEmail1,
        username: testName1,
        password: '134568793'
        //gender: 'x'
        //repassword: '987654321'
        //avatar: '',
      })
        .exec()
        .then(function () {
          done()
        })
        .catch(done)
    })

    afterEach(function (done) {
      // 删除测试用户
      User.deleteMany({ username: { $in: [testName1, testName2] } })
        .exec()
        .then(function () {
          done()
        })
        .catch(done)
    })

    after(function (done) {
      process.exit()
    })

    // 用户名错误的情况
    it('wrong username', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ email: testEmail1, username: '', password: '987654321', repassword: '987654321', agreement: '' })
        //.attach('avatar', path.join(__dirname, 'avatar.png'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.text.match(/用户名错误/))
          done()
        })
    })

    // 其余的参数测试自行补充
    // 邮箱被占用的情况
    it('duplicate username', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ email: testEmail1, username: testName1, password: '987654321', repassword: '987654321', agreement: '' })
        //.attach('avatar', path.join(__dirname, 'avatar.png'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.text.match(/邮箱名已被占用/))
          done()
        })
    })

    // 用户名被占用的情况
    it('duplicate username', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ email: testEmail2, username: testName1, password: '987654321', repassword: '987654321', agreement: '' })
        //.attach('avatar', path.join(__dirname, 'avatar.png'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.text.match(/用户名已被占用/))
          done()
        })
    })

    // 注册成功的情况
    it('success', function (done) {
      agent
        .post('/signup')
        .type('form')
        .field({ email: testEmail2, username: testName2, password: '987654321', repassword: '987654321', agreement: '' })
        //.attach('avatar', path.join(__dirname, 'avatar.png'))
        .redirects()
        .end(function (err, res) {
          if (err) return done(err)
          assert(res.text.match(/注册成功/))
          done()
        })
    })
  })
})

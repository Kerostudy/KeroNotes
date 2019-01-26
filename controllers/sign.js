var validator = require('validator');
var tools = require('../common/tools');

const sha256 = require('sha256')
const UserModel = require('../models/users')

exports.showsignup = function(req, res, next) {
  res.render('signup');
}

exports.signup = function(req, res, next) {
  var username = validator.trim(req.fields.username).toLowerCase();
  var email = validator.trim(req.fields.email).toLowerCase();
  var password = validator.trim(req.fields.password);
  var repassword = validator.trim(req.fields.repassword);
  var agreement = req.fields.agreement;

  // 验证信息的正确性
  try {
    if ([username, email, password, repassword].some(function(item) {
        return item === '';
      })) {
      throw new Error('信息不完整');
    }
    if (email.length > 50) {
      throw new Error('邮箱请限制在 50 个字符')
    }
    if (!validator.isEmail(email)) {
      throw new Error('邮箱不合法')
    }
    if (!(username.length >= 6 && username.length <= 20)) {
      throw new Error('名字请限制在 6-20 个字符')
    }
    if (!tools.validateId(username)) {
      throw new Error('用户名不合法 [a-zA-Z0-9\-_]+$')
    }
    if (password.length < 8) {
      throw new Error('密码至少 8 个字符')
    }
    if (password.length > 50) {
      throw new Error('密码请限制在 50 个字符')
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致')
    }
    if (agreement !== '') {
      throw new Error('同意本站条款和协议')
    }
    if (password !== '987654321') {
      throw new Error('请勿注册');
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    //fs.unlink(req.files.avatar.path)
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // 明文密码加密
  password = sha256(password)

  // 待写入数据库的用户信息
  let user = {
    email: email,
    username: username,
    password: password,
  }

  // 用户信息写入数据库
  UserModel.create(user)
    .then(function(result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0]
      // 删除密码这种敏感信息，将用户信息存入 session
      delete user.password
      req.session.user = user
      // 写入 flash
      if (req.session.user) {
        req.flash('success', '注册成功 3秒后跳转到首页')
        return res.redirect('/signup')
      }
    })
    .catch(function(e) {
      // 注册失败，异步删除上传的头像
      //fs.unlink(req.files.avatar.path)
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('duplicate key')) {
        req.flash('error', '用户名已被占用')
        return res.redirect('/signup')
      }
      next(e)
    })
}


exports.showsignin = function(req, res, next) {
  res.render('signin');
}

exports.signin = function(req, res, next) {
  const emailorusername = req.fields.emailorusername
  const password = req.fields.password

  // 校验参数
  try {
    if (!emailorusername.length) {
      throw new Error('请填写邮箱或用户名')
    }
    if (!password.length) {
      throw new Error('请填写密码')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(emailorusername)
    .then(function(user) {
      if (!user) {
        req.flash('error', '邮箱或用户不存在')
        return res.redirect('back')
      }
      // 检查密码是否匹配
      if (sha256(password) !== user.password) {
        req.flash('error', '用户名或密码错误')
        return res.redirect('back')
      }
      req.flash('success', '登录成功')
      // 用户信息写入 session
      delete user.password
      req.session.user = user
      // 跳转到主页
      res.redirect('/index')
    })
    .catch(next)
}

exports.showsignout = function(req, res, next) {
  // 清空 session 中用户信息
  req.session.user = null
  req.flash('success', '登出成功')
  // 登出成功后跳转到主页
  res.redirect('back')
}

exports.showforgot = function(req, res, next) {
  res.render('index');
}

exports.forgot = function(req, res, next) {
  res.render('forgot');
}

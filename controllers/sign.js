var validator = require('validator');
var sha256 = require('sha256')
var tools = require('../common/tools');
var UserModel = require('../models/users')

//GET /signup
exports.showsignup = function(req, res, next) {
  res.render('signup');
}

//POST /signup
exports.signup = function(req, res, next) {
  var username = validator.trim(req.fields.username).toLowerCase();
  var email = validator.trim(req.fields.email).toLowerCase();
  var password = validator.trim(req.fields.password);
  var repassword = validator.trim(req.fields.repassword);
  var agreement = req.fields.agreement;
  console.log(agreement)

  // 情報の正確さを確認する
  // Verify the correctness of the information
  // 验证信息的正确性
  try {
    if ([username, email, password, repassword].some(function(item) {
        return item === '';
      })) {
      throw new Error('必要な情報入力してください');
    }
    if (email.length > 50) {
      throw new Error('メールアドレスは50文字以内にしてください')
    }
    if (!validator.isEmail(email)) {
      throw new Error('メールアドレスが不正です')
    }
    if (!(username.length >= 6 && username.length <= 30)) {
      throw new Error('ユーザー名は6〜30文字以内にしてください')
    }
    if (!tools.validateId(username)) {
      throw new Error('ユーザー名が不正です [a-zA-Z0-9\-_]+$')
    }
    if (password.length < 8) {
      throw new Error('パスワード8文字以上にしてください')
    }
    if (password.length > 50) {
      throw new Error('パスワードは50文字を超えないでください')
    }
    if (password !== repassword) {
      throw new Error('入力したパスワードが一致しません')
    }
    if (agreement !== '') {
      throw new Error('このサイトの利用規約に同意してくだだい')
    }
    if (password !== '987654321') {
      throw new Error('登録しないでください');
    }
  } catch (e) {
    // 登録に失敗した場合、登録ページに戻ってエラーを送信する。
    // Registration failed, return to registration page and send error.
    // 注册失败，返回注册页并发送错误。
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // クリアテキストのパスワードを暗号化
　// Encrypted plaintext password
  // 明文密码加密
  password = sha256(password)

　// データベースへの書き込みを待っているユーザー情報
　// User information waiting to be written to the database
  // 等待写入数据库的用户信息
  let user = {
    email: email,
    username: username,
    password: password,
  }

  // ユーザー情報がデータベースに書き込まれる
  // User information is written to the database
  // 用户信息写入数据库
    UserModel.create(user)
    .then(function(result) {
      // The following user is the value after writing to mongodb, including email, username, password, _id, etc.
      // 下記の user はmongodbへの書き込み後の値。email，username，password，_idなどの情報が含まれる。
      // 下面 user 是写入 mongodb 后的值，包含 email，username，password，_id 等信息
      user = result.ops[0]
      // 機密情報のパスワードを削除して、ユーザー情報をsessionに保存します。
      // Delete the sensitive information password and save the user information to the session.
      // 删除敏感信息密码，将用户信息存入 session
      delete user.password
      req.session.user = user
      // 登録成功のメッセージをflashに書き込み
      // Write registration success message to flash
      // 将注册成功消息写入flash
      if (req.session.user) {
        req.flash('success', '登録成功！')
        return res.redirect('/')
      }
    })
    .catch(function(e) {
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('duplicate key')) {
        req.flash('error', 'ユーザー名はすでに登録されています')　//
        return res.redirect('/signup')
      }
      next(e)
    })
}

//GET /signin
exports.showsignin = function(req, res, next) {
  res.render('signin');
}

//POST /signin
exports.signin = function(req, res, next) {
  // メールアドレスまたはユーザー名でログインできる（未実装）
  // Mail address or username can be logged in (not implemented)
  // 邮箱或用户名都可以登录（未实现）
  const emailorusername = req.fields.emailorusername
  const password = req.fields.password

  // 校验参数
  try {
    if (!emailorusername.length) {
      throw new Error('メールアドレスまたはユーザー名を入力してください')
    }
    if (!password.length) {
      throw new Error('パスワードを入力してください')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByName(emailorusername)
    .then(function(user) {
      if (!user) {
        req.flash('error', 'メールアドレスまたはユーザー名が存在しません')
        return res.redirect('back')
      }
      if (sha256(password) !== user.password) {
        req.flash('error', 'ユーザー名またはパスワードが正しくありません')
        return res.redirect('back')
      }
      req.flash('success', 'ログイン成功！')
      // ユーザー情報がsessionに書き込む
      // write user information to session
      // 用户信息写入 session
      delete user.password
      req.session.user = user
      res.redirect('/')
    })
    .catch(next)
}

exports.showsignout = function(req, res, next) {
  // session内のユーザー情報を消去する
  // Clear user information in session
  // 清空 session 中用户信息
  req.session.user = null
  req.flash('success', 'ログアウト成功')
  res.redirect('back')
}

//GET /forgot
exports.showforgot = function(req, res, next) {
  res.render('forgot');
}

//POST /forgot
exports.forgot = function(req, res, next) {
  res.render('forgot');
}

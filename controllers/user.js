const UserModel = require('../models/users')
const sha256 = require('sha256')
const path = require('path')

//GET /settings
exports.showsettings = function(req, res, next) {
  const user_id = req.session.user._id
  UserModel.getUserByUserid(user_id)
    .then(function(result) {
      if (result._id.toString() !== user_id.toString()) {
        throw new Error('権限がありません')
      }
      res.render('settings', {
        post: result
      })
    })
    .catch(next)
}

//POST /settings
exports.settings = function(req, res, next) {
  const user_id = req.session.user._id
  const first_name = req.fields.first_name
  const last_name = req.fields.last_name
  const avatar =  req.files.avatar.path.split(path.sep).pop()
  const organization = req.fields.organization
  const location = req.fields.location
  const profile = req.fields.profile
  const password = req.fields.password
  const repassword = req.fields.repassword

  try {
    // アバターのサイズを制限する？
    // Limit avatar size？
    // 限制头像大小？
    // if (avatar) {
    //   if (avatar.length > 2048) {
    //     throw new Error('アイコンの大きさは2MBを超えないでください')
    //   }
    // }
    if (organization.length > 30) {
      throw new Error('組織・会社は30文字を超えないでください')
    }
    if (location.length > 30) {
      throw new Error('居住地は30文字を超えないでください')
    }
    if (location.length > 200) {
      throw new Error('居住地は200文字を超えないでください')
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
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  UserModel.getUserByUserid(user_id)
    .then(function(post) {
      try {
        if (!post) {
          throw new Error('ユーザーが存在しません')
        }
        if (post.password.toString() === password.toString()) {
          throw new Error('新しいパスワードを以前と同じにすることはできません')
        }
      } catch (e) {
        req.flash('error', e.message)
        return res.redirect('back')
      }
      UserModel.updateUserById(user_id, {
          avatar: avatar,
          first_name: first_name,
          last_name: last_name,
          organization: organization,
          location: location,
          profile: profile,
          // パスワードが空の場合は更新されません？
          // Not updated when the password is empty？
          // 密码为空时不跟新？
          password: password
        })
        .then(function() {
          req.flash('success', '正常に更新されました')
          res.redirect('back')
        })
        .catch(next)
    })
}

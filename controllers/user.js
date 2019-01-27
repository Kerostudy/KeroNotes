const UserModel = require('../models/users')
const sha256 = require('sha256')

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
  const password = req.fields.password
  const repassword = req.fields.repassword

  try {
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
          password: password
        })
        .then(function() {
          req.flash('success', '正常に更新されました')
          res.redirect('back')
        })
        .catch(next)
    })
}

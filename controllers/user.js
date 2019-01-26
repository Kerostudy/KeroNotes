const UserModel = require('../models/users')

const sha256 = require('sha256')

exports.showsettings = function (req, res, next) {
  //const article_id = req.params.article_id
  const userid = req.session.user._id
  console.log(userid)

  UserModel.getUserByUserid(userid)
    .then(function (result) {
    	console.log(result)
      if (result._id.toString() !== userid.toString()) {
        throw new Error('没有权限')
      }
      res.render('settings',{
      post: result
  })
    })
    .catch(next)
}

exports.settings = function (req, res, next) {
  const userid = req.session.user._id
  //const username = req.session.user.username
  //const email = req.fields.email
  //const username = req.fields.username
  const password = req.fields.password
  const repassword = req.fields.repassword

  // 校验参数
  try {
  	if (password.length < 8) {
			throw new Error('密码至少 8 个字符')
		}
		if (password.length  > 50) {
			throw new Error('密码请限制在 50 个字符')
		}
		if (password !== repassword) {
			throw new Error('两次输入密码不一致')
		}
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

UserModel.getUserByUserid(userid)
    .then(function (post) {
    	try {
      if (!post) {
        throw new Error('用户不存在 ')
      }
      if (post.password.toString() === password.toString()){
      	 throw new Error('新密码不能与之前相同')
      }
       } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

UserModel.updateUserById(userid, { password: password })
        .then(function () {
          req.flash('success', '更新成功')
          // 编辑成功后跳转到文章页
          res.redirect('settings')
        })
    .catch(next)
    })
}
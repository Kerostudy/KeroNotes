const PostModel = require('../models/posts')

//GET /
//すべてのユーザー記事を取得
//Get all user articles
//获取所有用户文章
exports.index = function(req, res, next) {
  PostModel.getAllPosts()
    .then(function(posts) {
      res.render('index', {
        posts: posts
      })
    })
    .catch(next)
}

//GET /index
// /index がアクセスされた場合　/　に誘導する
// Jump to / when /index is accessed
// 访问/index时跳转到/
exports.toindex = function(req, res, next) {
  res.redirect('/')
}

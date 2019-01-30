const UserModel = require('../models/users')
const CommentModel = require('../models/comments')
const PostModel = require('../models/posts')

//GET /:username
// マイページ
// mypage
// 个人主页
exports.mypage = function (req, res, next) {
  const username = req.params.username
  UserModel.getUserByNameorEmail(username)
    .then(function (result) {
      if (!result) {
        return res.render('404')
      } else {
        user_id = result._id
      }
      PostModel.getPosts(user_id)
        .then(function (articles) {
          res.render('userpage', {
            username: username,
            articles: articles
          })
        })
        .catch(next)
    })
}

//GET /:username/notes/:article_id
// 記事ページ
// article page
// マイページ
exports.article_id = function (req, res, next) {
  const article_id = req.params.article_id
  Promise.all([
      // 記事情報を取得  Get article information  获取文章信息
      PostModel.getPostById(article_id),
      // この記事に関するすべてのコメントを入手してください。
      // Get all the comments on this article
      // 获取该文章所有留言
      CommentModel.getComments(article_id),
      // 閲覧回数1回増やす  Views plus 1  浏览次数加 1
      PostModel.incPv(article_id)
    ])
    .then(function (result) {
      const article = result[0]
      const comments = result[1]
      if (!article) {
        return res.render('404')
      }
      res.render('note', {
        article: article,
        comments: comments
      })
    })
    .catch(next)
}

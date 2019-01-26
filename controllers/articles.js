const UserModel = require('../models/users')
const CommentModel = require('../models/comments')
const ArticleModel = require('../models/articles')

exports.username = function (req, res, next) {
  const username = req.params.username
  UserModel.getUserByName(username)
    .then(function (user) {
      if (!user) {
        return res.render('404')
      } else {
        user_id = user._id
      }
      console.log(user_id)
      ArticleModel.getPosts(user_id)
        .then(function (articles) {
          res.render('userpage', {
            username: username,
            articles: articles
          })
          console.log(articles)
        })
        
        .catch(next)
    })
}

exports.article_id = function (req, res, next) {
  const article_id = req.params.article_id
  Promise.all([
      ArticleModel.getPostById(article_id), // 获取文章信息
      CommentModel.getComments(article_id), // 获取该文章所有留言
      ArticleModel.incPv(article_id) // pv 加 1
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
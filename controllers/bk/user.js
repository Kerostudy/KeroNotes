const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
//const CommentModel = require('../models/comments')

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/:username', checkLogin,function (req, res, next) {
  const username = req.params.username
  //const author = req.session.user._id

  PostModel.getPosts(username)
    .then(function (posts) {
      //post = posts.ops[0] 
      res.render( username, {
        posts: posts
      })
    })
    .catch(next)
})

module.exports = router

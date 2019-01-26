const PostModel = require('../models/posts')

exports.index = function (req, res, next) {
  //const author = req.params.username
   console.log(req.session)
  if (req.session.user !== null && req.session.user !== undefined){
  const author = req.session.user.username
}
//console.log(author)

  PostModel.getAllPosts()
    .then(function (posts) {
      //console.log(posts) 
      res.render( 'index', {
        flag: 0 , //不显示编辑删除功能
        if (author) {
        username: author
        },
        posts: posts
      })
    })
  }

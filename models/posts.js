const marked = require('marked')
const Post = require('../lib/mongo').Post
const CommentModel = require('./comments')

//给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function(posts) {
    return Promise.all(posts.map(function(post) {
      return CommentModel.getCommentsCount(post._id).then(function(commentsCount) {
        post.commentsCount = commentsCount
        return post
      })
    }))
  },
  afterFindOne: function(post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function(count) {
        post.commentsCount = count
        return post
      })
    }
    return post
  }
})

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function(posts) {
    return posts.map(function(post) {
      post.content = marked(post.content)
      //console.log(post.content)
      return post
    })
  },
  afterFindOne: function(post) {
    if (post) {
      post.content = marked(post.content)
      //console.log(post.content)
    }
    return post
  }
})

module.exports = {

  // 作成時間の降順ですべてのユーザー記事を取得する
  // Get all user articles in descending order of creation time
  // 按创建时间降序获取所有用户文章
  getAllPosts: function getAllPosts() {
    return Post
      .find()
      .populate({
        path: 'author',
        model: 'User'
      })
      .sort({
        _id: -1
      })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec()
  },

  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
    console.log(postId)
    return Post
      .findOne({
        _id: postId
      })
      .populate({
        path: 'author',
        model: 'User'
      })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
    console.log(postId)
  },

  // 通过关键字获取文章
  // getPostByWord: function getPostWord(post) {
  //   console.log(post)
  //   return Post
  //     .find({ : postId })
  //     .populate({ path: 'author', model: 'User' })
  //     .addCreatedAt()
  //     .addCommentsCount()
  //     .contentToHtml()
  //     .exec()
  //   console.log(postId)
  // },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author) {
    const query = {}
    if (author) {
      query.author = author
    }
    return Post
      .find({
        author: author
      })
      .populate({
        path: 'author',
        model: 'User'
      })
      .sort({
        _id: -1
      })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec()
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({
        _id: postId
      }, {
        $inc: {
          pv: 1
        }
      })
      .exec()
  },

  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId) {
    return Post
      .findOne({
        _id: postId
      })
      .populate({
        path: 'author',
        model: 'User'
      })
      .exec()
  },

  // 通过文章 id 更新一篇文章
  updatePostById: function updatePostById(postId, data) {
    return Post.update({
      _id: postId
    }, {
      $set: data
    }).exec()
  },

  // 通过文章 id 删除一篇文章
  delPostById: function delPostById(postId) {
    return Post.deleteOne({
        _id: postId
      })
      .exec()
      .then(function(res) {
        // 文章删除后，再删除该文章下的所有留言
        // if (res.result.ok && res.result.n > 0) {
        //   return CommentModel.delCommentsByPostId(postId)
        // }
      })
  }
}

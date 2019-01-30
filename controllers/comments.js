const CommentModel = require('../models/comments')

// POST /comments
// コメントを作成する   Create a comment  创建一条留言
exports.create = function (req, res, next) {
  const author = req.session.user._id
  const postId = req.fields.postId
  const content = req.fields.content

  try {
    if (!content.length) {
      throw new Error('コメントを記入してください。')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  const comment = {
    author: author,
    postId: postId,
    content: content
  }
  CommentModel.create(comment)
    .then(function () {
      req.flash('success', 'コメントに成功しました。')
      // 留言成功后跳转到上一页
      res.redirect('back')
    })
    .catch(next)
}

// GET /comments/:commentId/remove
// コメントを削除する    Delete a comment  删除一条留言
exports.remove = function (req, res, next) {
  const commentId = req.params.commentId
  const author = req.session.user._id

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      if (!comment) {
        throw new Error('コメントが存在しません。')
      }
      if (comment.author.toString() !== author.toString()) {
        throw new Error('コメントを削除する権限がありません。')
      }
      CommentModel.delCommentById(commentId)
        .then(function () {
          req.flash('success', 'コメントを削除する')
          res.redirect('back')
        })
        .catch(next)
    })
}

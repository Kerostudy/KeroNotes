const PostModel = require('../models/posts')

// GET /sharing
exports.showcreate = function(req, res, next) {
  try {
    if (req.session.user == null) {
      throw new Error('ログインしてください')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  var username = req.session.user.username
  res.render('sharing', {
    username: username
  })
}

// POST /sharing
exports.create = function(req, res, next) {
  const author = req.session.user._id
  const username = req.session.user.username
  const title = req.fields.title
  const label = req.fields.label
  const content = req.fields.content

  try {
    if (!title) {
      throw new Error('タイトルは必須です。')
    }
    if (title.length > 256) {
      throw new Error('タイトルは 256 文字以内で入力してください。')
    }
    if (!label) {
      throw new Error('タグを空にすることはできません。')
    }
    if (label.length > 30) {
      throw new Error('タグが長過ぎます（30文字まで）。')
    }
    if (!content.length) {
      throw new Error('本文は必須です。')
    }
    if (!content.length > 262144) {
      throw new Error('本文は 262144 文字以内で入力してください。')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author: author,
    title: title,
    label: label,
    content: content
  }
  PostModel.create(post)
    .then(function(result) {
      // この result は、_idを含む　mongodb　に挿入後の値です。
      //This result is the value after inserting mongodb, containing _id
      // 此 result 是插入 mongodb 后的值，包含 _id。
      req.flash('success', '投稿に成功しました')
      // 发表成功后跳转到该文章页
      res.redirect(`/${username}/notes/${result.ops[0]._id}`)
    })
    .catch(next)
}

//GET /sharing/:article_id/edit
exports.showedit = function(req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id
  PostModel.getRawPostById(article_id)
    .then(function(result) {
      if (!result) {
        throw new Error('この記事は存在しません。')
      }
      if (result.author._id.toString() !== author.toString()) {
        throw new Error('権限なし。')
      }
      res.render('edit', {
        post: result
      })
    })
    .catch(next)
}

//POST /sharing/:article_id/edit
exports.edit = function(req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id
  const username = req.session.user.username
  const title = req.fields.title
  const label = req.fields.label
  const content = req.fields.content

  try {
    if (!title) {
      throw new Error('タイトルは必須です。')
    }
    if (title.length > 256) {
      throw new Error('タイトルは 256 文字以内で入力してください。')
    }
    if (!label) {
      throw new Error('タグを空にすることはできません。')
    }
    if (label.length > 30) {
      throw new Error('タグが長過ぎます（30文字まで）。')
    }
    if (!content.length) {
      throw new Error('本文は必須です。')
    }
    if (!content.length > 262144) {
      throw new Error('本文は 262144 文字以内で入力してください。')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(article_id)
    .then(function(result) {
      if (!result) {
        throw new Error('この記事は存在しません')
      }
      if (result.author._id.toString() !== author.toString()) {
        throw new Error('権限なし')
      }
      PostModel.updatePostById(article_id, {
          title: title,
          label: label,
          content: content
        })
        .then(function() {
          req.flash('success', '記事編集に成功しました。')
          // 編集に成功したら記事ページに遷移する
          // Jump to the article page after successful editing
          // 编辑成功后跳转到文章页
          res.redirect(`/${result.author.username}/notes/${result._id}`)
        })
        .catch(next)
    })
}

//POST /sharing/:article_id/delete
exports.remove = function(req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id

  PostModel.getRawPostById(article_id)
    .then(function(result) {
      if (!result) {
        throw new Error('この記事は存在しません。')
      }
      if (result.author._id.toString() !== author.toString()) {
        throw new Error('権限なし')
      }
      PostModel.delPostById(article_id)
        .then(function() {
          req.flash('success', '記事を削除しました。')
          // 削除に成功したらマイホームページに遷移する
          // Jump to my homepage after successful deletion
          // 删除成功后跳转到我的主页
          res.redirect(`/${result.author.username}`)
        })
        .catch(next)
    })
}

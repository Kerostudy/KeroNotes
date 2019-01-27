const PostModel = require('../models/articles')

// GET
exports.showcreate =  function (req, res, next) {
  try {
    if (req.session.user == null){
    throw new Error('请登录 否则无法分享')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }
  var username = req.session.user.username
  res.render('sharing',{
    username: username
  })
}

exports.create = function (req, res, next) {
  const author = req.session.user._id
  const username = req.session.user.username
  const title = req.fields.title
  const label = req.fields.label
  const content = req.fields.content

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  let post = {
    author: author,
    //username: username,
    title: title,
    label: label,
    content: content
  }

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      console.log(result)
      post = result
      req.flash('success', '发表成功')
      // 发表成功后跳转到该文章页
      console.log(username)
      res.redirect(`/${username}`)
    })
    .catch(next)
}

exports.showedit = function (req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id

  PostModel.getRawPostById(article_id)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      if (!result) {
        throw new Error('该文章不存在')
      }
      if (result.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      res.render('edit',{
      post: result
  })
    })
    .catch(next)
}

exports.edit = function (req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id
  const username = req.session.user.username
  const title = req.fields.title
  const label = req.fields.label
  const content = req.fields.content

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

PostModel.getRawPostById(article_id)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }

PostModel.updatePostById(article_id, { title: title, label:label,content: content })
        .then(function () {
          req.flash('success', '编辑文章成功')
          // 编辑成功后跳转到文章页
          res.redirect(`/${post.username}`)
        })
    .catch(next)
    })
}

exports.remove = function (req, res, next) {
  const article_id = req.params.article_id
  const author = req.session.user._id


  PostModel.getRawPostById(article_id)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      console.log(post)
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.delPostById(article_id)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到我的主页
          res.redirect(`/${post.author.username}`)
        })
        .catch(next)
    })
}

const config = require('config-lite')(__dirname)
const Mongolass = require('mongolass')
const mongolass = new Mongolass()
mongolass.connect(config.mongodb)

exports.User = mongolass.model('User', {
  email: { type: 'string', required: true },
  username: { type: 'string', required: true },
  password: { type: 'string', required: true },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'], default: 'x' },
  bio: { type: 'string' },
  location: { type: 'string' },
  profile: { type: 'string' },
  githubId: { type: 'string'},
  githubUsername: {type: 'string'},
  githubAccessToken: {type: 'string'},
  // is_block: {type: Boolean, default: false},

  // //--用户产生数据meta
  // score: { type: 'Number', default: 0 },
  // topic_count: { type: 'Number', default: 0 },
  // reply_count: { type: 'Number', default: 0 },
  // follower_count: { type: 'Number', default: 0 },
  // following_count: { type: 'Number', default: 0 },
  // collect_tag_count: { type: 'Number', default: 0 },
  // collect_topic_count: { type: 'Number', default: 0 },
  // create_at: { type: 'Date', default: Date.now },
  // update_at: { type: 'Date', default: Date.now },
  // is_star: { type: Boolean },
  // level: { type: 'string' },
  // active: { type: Boolean, default: false },

  // //-mail
  // receive_reply_mail: {type: Boolean, default: false },
  // receive_at_mail: { type: Boolean, default: false },
  // from_wp: { type: Boolean },

  // retrieve_time: {type: 'Number'},
  // retrieve_key: {type: 'string'},

  // accessToken: {type: 'string'},
})
// Find the user based on the username. The username is globally unique.
// ユーザー名に基づいてユーザーを検索する。ユーザー名はグローバルに一意である
// 根据用户名找到用户，用户名全局唯一
exports.User.index({ username: 1}, { unique: true }).exec()
// メールアドレスはグローバルに一意であること（未実現）。
// The email address is globally unique has not been implemented.
// 邮箱全局唯一未实现


const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
    }
    return result
  }
})

exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  title: { type: 'string', required: true },
  label: { type: 'string'},
  content: { type: 'string', required: true },
  pv: { type: 'number', default: 0 }
})
exports.Post.index({ author: 1, _id: -1 }).exec()// 按创建时间降序查看用户的文章列表

exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId, required: true },
  content: { type: 'string', required: true },
  postId: { type: Mongolass.Types.ObjectId, required: true }
})
exports.Comment.index({ postId: 1, _id: 1 }).exec()// 通过文章 id 获取该文章下所有留言，按留言创建时间升序

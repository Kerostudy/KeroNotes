const User = require('../lib/mongo').User

//判断是不是邮箱
function isEmail(str) {
  var myReg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
  if (myReg.test(str)) return true;
  return false;
}

module.exports = {
  // 新ユーザーを登録する
  // Register a new user
  // 注册一个新用户
  create: function create(user) {
    return User.create(user).exec()
  },

  // 通过用户名获取用户信息
  getUserByName: function getUserByName(user) {
    if (isEmail(user)) {
      return User
        .findOne({
          email: user
        })
        .addCreatedAt()
        .exec()
    } else {
      return User
        .findOne({
          username: user
        })
        .addCreatedAt()
        .exec()
    }
  },

  getUserByUserid: function getUserByUserid(user_id) {
    return User
      .findOne({
        _id: user_id
      })
      .addCreatedAt()
      .exec()
  },

  updateUserById: function updateUserById(postId, data) {
    return User.update({
      _id: postId
    }, {
      $set: data
    }).exec()
  },
}

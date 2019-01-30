/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user || !req.session.user._id) {
    return res.status(403).send('forbidden!');
  }
  next();
};

/**
 * 登录则禁止
 */
exports.userNotRequired = function (req, res, next) {
    if (req.session.user !== null) {
    return res.status(403).send('forbidden!');
  }
  next();
};

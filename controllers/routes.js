var index = require('./index');
var sign = require('./sign');
var user = require('./user');
var articles = require('./articles');
var auth = require('../common/auth');
var sharing = require('./sharing')
var comments =require('./comments')

module.exports = function (app) {
  app.get('/', index.index);
  app.get('/index', index.index);

  app.get('/signup', sign.showsignup);
  app.post('/signup', sign.signup);
  app.get('/signin', sign.showsignin);
  app.post('/signin', sign.signin);
  app.get('/signout', sign.showsignout);
  app.get('/forgot', sign.forgot);
  app.post('/forgot', sign.showforgot);

  app.get('/settings', auth.userRequired, user.showsettings);
  app.post('/settings', auth.userRequired, user.settings);

  app.get('/sharing', sharing.showcreate);
  app.post('/sharing', sharing.create);
  app.get('/sharing/:article_id/edit', auth.userRequired, sharing.showedit);
  app.post('/sharing/:article_id/edit', auth.userRequired, sharing.edit);
  app.get('/sharing/:article_id/delete', auth.userRequired, sharing.remove);

  app.get('/:username', articles.username);
  app.get('/:username/notes/:article_id', articles.article_id);
  app.post('/comments', auth.userRequired, comments.create);
  app.get('/comments/:commentId/remove', auth.userRequired, comments.remove);

  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  })
}

module.exports = {
  port: 4000,
  session: {
    secret: 'keronotes',
    key: 'keronotes',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/keronotes'
}

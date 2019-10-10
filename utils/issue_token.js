const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const payload = { id: req.user._id }
  const token = jwt.sign(payload, process.env.JWT_SECRET)
  res.cookie('token', token, {
    expires: new Date(Date.now() + 1000 * 3600 * 24),
    httpOnly: true
  })
  next()
}

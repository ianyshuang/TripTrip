const isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    return next()
  } else {
    return res.status(403).end()
  }
}

module.exports = isAdmin

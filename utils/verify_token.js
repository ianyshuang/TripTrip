const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
  const forgotPasswordToken = req.cookies.forgot_password
  if (!forgotPasswordToken) {
    res.status(404).end()
    return
  }
  try {
    const decoded = await jwt.verify(forgotPasswordToken, process.env.JWT_SECRET)
    req.resetId = decoded.id
    next()
  } catch (error) {
    console.log(error)
    res.status(400).end()
  }
}

module.exports = verifyToken

import jwt from 'jsonwebtoken'
import UserRepository from '../repository/UserRepository.js'
import { setupEnvironment } from '../config/environment.js'

setupEnvironment(process.env.NODE_ENV)

const authenticate = async (req, res) => {
  const user = await UserRepository.login(req.body.email, req.body.password)
  if (user === null) {
    res.status(403).send('forbidden')
  }

  // set current user
  res.send({
    ...user,
    token: generateAccessToken(user),
  })
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    req.user = user

    next()
  })
}

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.TOKEN_SECRET, { expiresIn: '1800s' })
}

export {
  authenticate,
  authenticateToken,
  generateAccessToken,
}
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const crypto = require('crypto')
function getUserIdFromEnv(username) {
  try {
    const envPath = path.resolve(__dirname, '.env.local')
    if (!fs.existsSync(envPath)) {
      console.error('Error: .env.local file not found')
      return null
    }

    const envContent = fs.readFileSync(envPath, 'utf8')
    const envVars = dotenv.parse(envContent)

    const userId = envVars[username]
    if (!userId) {
      console.error(`Error: User ID not found for username: ${username}`)
      return null
    }

    return userId
  } catch (error) {
    console.error('Error reading .env.local file:', error)
    return null
  }
}

function parseCommandLineArgs() {
  const argv = process.argv.slice(2)
  let username = null
  let origin = null
  let port = null
  let env = null

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if ((arg === '-u' || arg === '--user') && i + 1 < argv.length) {
      username = argv[i + 1]
      i++
    } else if (arg === '--origin' && i + 1 < argv.length) {
      origin = argv[i + 1]
      i++
    } else if (arg === '--port' && i + 1 < argv.length) {
      port = argv[i + 1]
      i++
    } else if (arg === '--env' && i + 1 < argv.length) {
      env = argv[i + 1]
      i++
    }
  }

  if (origin) {
    origin = origin.replace(/^(?!http)/, 'http://')
  }

  return { username, origin, port, env }
}

const getToken = userId => {
  const secret = 'Q3HraAbDkmKoPzaBEYzPXB1zJXmWlQ169'
  function __encrypt(string) {
    return crypto
      .createHmac('sha256', secret)
      .update(string + secret)
      .digest('hex')
  }
  function encodeBase64(string) {
    if (typeof string !== 'string') return null
    return Buffer.from(string || '').toString('base64')
  }
  function encodeStaticTokenByUserId(userId) {
    let token = __encrypt(userId)
    return encodeBase64(userId) + '.' + encodeBase64(token)
  }
  const token = encodeStaticTokenByUserId(userId)
  return token
}

module.exports = {
  getUserIdFromEnv,
  parseCommandLineArgs,
  getToken
}

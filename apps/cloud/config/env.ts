import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'

const { argv } = process
const log = console.log

export const URL_MAP = {
  dev: 'https://cloud.tapdata.io/console/',
  test: 'https://test.cloud.tapdata.net/',
} as const

export type ServeEnvKey = keyof typeof URL_MAP

function encodeBase64(str: string): string | null {
  if (typeof str !== 'string') return null
  return Buffer.from(str || '').toString('base64')
}

export const getUserIds = (): Record<string, string> => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const userMap: Record<string, string> = {}

    envContent.split('\n').forEach((line) => {
      const [key, value] = line.trim().split('=')
      if (key && value) {
        userMap[key] = value
      }
    })

    return userMap
  } catch (error: unknown) {
    const err = error as Error
    console.warn('Failed to read .env.local file:', err.message)

    log(chalk.red('❌ Error: .env.local file not found'))
    log(chalk.yellow('Create .env.local with this command:'))
    log('')
    log(chalk.cyan('echo "xxx=userId" > .env.local'))
    log('')
    log(chalk.cyan('Then run:'))
    log(chalk.green('pnpm dev -- -u xxx'))
    log('')

    return Object.create(null) as Record<string, string>
  }
}

/**
 * 解析命令行参数
 */
export const parseArgs = () => {
  log(chalk.cyan('\nDevelopment Environment Usage:'))
  log(chalk.yellow('1. Configure username in .env.local:'))
  log(chalk.green('   echo "username=userId" >> .env.local'))
  log(chalk.yellow('\n2. Available Parameters:'))
  log(chalk.cyan('   Using -u parameter:'))
  log(chalk.green('   pnpm dev -- -u <username>'))
  log(chalk.cyan('   Using --user parameter:'))
  log(chalk.green('   pnpm dev -- --user <userId>'))
  log(chalk.cyan('   Using --origin parameter:'))
  log(chalk.green('   pnpm dev -- --origin <target_url>'))
  log(chalk.cyan('   Use --no-help to disable this message'))
  log(chalk.cyan('\nDefaults:'))
  log(chalk.green('   • Username: First entry from .env.local'))
  log(chalk.green('   • Origin: https://cloud.tapdata.io/console/'))
  log(chalk.cyan('\nExample:'))
  log(chalk.green('   pnpm dev -- -u xxx --origin https://cloud.tapdata.net/'))
  log('')

  const userIds = getUserIds()
  const SERVE_ENV: ServeEnvKey = (process.env.SERVE_ENV as ServeEnvKey) || 'dev'
  const uIndex = argv.indexOf('-u')
  let username = uIndex !== -1 && argv[uIndex + 1] ? argv[uIndex + 1] : ''
  let userId

  if (username) {
    if (userIds[username]) {
      userId = userIds[username]
    } else {
      console.warn(`User ID for '${username}' not found in .env.local`)
    }
  } else if (argv.includes('--user')) {
    const userIndex = argv.indexOf('--user')

    if (userIndex !== -1 && argv[userIndex + 1]) {
      userId = argv[userIndex + 1]
    }
  } else if (Object.keys(userIds).length > 0) {
    username = Object.keys(userIds)[0]
    userId = userIds[username]
  }

  const target = argv.includes('--origin')
    ? argv[argv.indexOf('--origin') + 1].replace(/^(?!http)/, 'http://')
    : URL_MAP[SERVE_ENV]

  if (!userId) {
    console.warn('No user ID provided')
    process.exit(1)
  }

  const accessToken = getAccessToken(userId)
  const printDivider = (length = 40, char = '─', color = 'gray') => {
    log((chalk as any)[color](char.repeat(length)))
  }

  log(
    `${chalk.bgBlue(` User Name `.padEnd(14))} ${chalk.white.bold(String(username))}`,
  )
  printDivider()
  log(
    `${chalk.bgBlue(` User ID `.padEnd(14))} ${chalk.white.bold(String(userId))}`,
  )
  printDivider()
  log(
    `${chalk.bgBlue(` User Token `.padEnd(14))} ${chalk.white.bold(
      String(accessToken),
    )}`,
  )
  printDivider()
  log(
    `${chalk.bgBlue(` Proxy Server `.padEnd(14))} ${chalk.white.bold(String(target))}`,
  )
  printDivider()

  return {
    userId,
    accessToken,
    target,
  }
}

/**
 * 根据用户ID生成访问令牌
 */
export const getAccessToken = (userId: string): string => {
  const secret = 'Q3HraAbDkmKoPzaBEYzPXB1zJXmWlQ169'

  function __encrypt(str: string) {
    return crypto
      .createHmac('sha256', secret)
      .update(str + secret)
      .digest('hex')
  }

  function encodeStaticTokenByUserId(userId: string) {
    const token = __encrypt(userId)
    return `${encodeBase64(userId)}.${encodeBase64(token)}`
  }

  const token = encodeStaticTokenByUserId(userId)
  return token
}

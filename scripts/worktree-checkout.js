#!/usr/bin/env node

import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { argv, exit, stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline'
import chalk from 'chalk'
import inquirer from 'inquirer'

// 添加搜索功能支持
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt)

// Parse command line arguments
const args = argv.slice(2)
const cliOptions = {
  branch: null,
  path: null,
}

// Simple argument parser
for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  if (arg === '--branch' || arg === '-b') {
    cliOptions.branch = args[++i]
  } else if (arg === '--path' || arg === '-p') {
    cliOptions.path = args[++i]
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
${chalk.bold.blue('Git Worktree Checkout Tool')}
${chalk.dim('Create a new worktree for branch development')}

${chalk.yellow('Usage:')}
  pnpm nb [options]

${chalk.yellow('Options:')}
  -b, --branch <name>   Specify branch name (default: develop)
  -p, --path <path>     Specify worktree path (default: ../tap-web@3)
  -h, --help            Show this help message
    `)
    exit(0)
  }
}

// Use readline/promises if available for cleaner async code
const rl = createInterface({
  input: stdin,
  output: stdout,
})

const defaultWorktreePath = '../tap-web@3'
const defaultBranch = 'develop'

// Promisify the exec function
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stdout.trim())
    })
  })
}

// Promisify readline question
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

// Function to get all available branches
async function getAvailableBranches() {
  try {
    const output = await execPromise('git branch -a')
    return output
      .split('\n')
      .map((branch) =>
        branch
          .trim()
          .replace(/^\*\s+/, '')
          .replace(/^remotes\/origin\//, ''),
      )
      .filter((branch) => branch && !branch.includes('HEAD ->'))
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort() // Sort alphabetically for better UI
  } catch (error) {
    console.error(chalk.red(`Error fetching branches: ${error.message}`))
    return []
  }
}

// Function to let user manually enter a branch name
async function enterBranchManually(defaultBranch) {
  const branch = await question(
    chalk.yellow(`Enter branch name (default: ${defaultBranch}): `),
  )
  return branch.trim() || defaultBranch
}

// 带搜索功能的分支选择
async function selectBranchWithSearch(branches, defaultBranch) {
  // 查找默认分支的索引
  const defaultIndex = branches.indexOf(defaultBranch)

  // 转换分支数据格式
  const choices = branches.map((branch) => ({
    name: branch === defaultBranch ? `${branch} (default)` : branch,
    value: branch,
  }))

  // 搜索过滤函数
  const searchBranches = (answers, input = '') => {
    return new Promise((resolve) => {
      const filteredChoices = choices.filter((choice) =>
        choice.value.toLowerCase().includes((input || '').toLowerCase()),
      )
      resolve(filteredChoices)
    })
  }

  try {
    const { selectedBranch } = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'selectedBranch',
        message: 'Select or search for a branch:',
        source: searchBranches,
        pageSize: 15,
        emptyText: 'No matching branches found',
        default: defaultIndex !== -1 ? branches[defaultIndex] : undefined,
      },
    ])

    return selectedBranch
  } catch (error) {
    console.error(
      chalk.yellow(`\nError with search selection: ${error.message}`),
    )
    // 如果自动完成功能失败，回退到标准列表选择
    return selectBranchInteractive(branches, defaultBranch)
  }
}

// Function to let user select a branch using inquirer
async function selectBranchInteractive(branches, defaultBranch) {
  // Find index of default branch
  const defaultIndex = branches.indexOf(defaultBranch)

  const { selectedBranch } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedBranch',
      message: 'Select a branch:',
      choices: branches.map((branch) => ({
        name: branch === defaultBranch ? `${branch} (default)` : branch,
        value: branch,
      })),
      default: defaultIndex !== -1 ? defaultIndex : 0,
      pageSize: 15,
    },
  ])

  return selectedBranch
}

// Fallback branch selection for environments where interactive selection doesn't work
async function selectBranchFallback(branches, defaultBranch) {
  console.log(chalk.cyan('\nAvailable branches:'))

  // Display branches with numbers
  branches.forEach((branch, index) => {
    const isDefault = branch === defaultBranch
    const prefix = isDefault ? chalk.green('* ') : '  '
    console.log(
      `${prefix}${index + 1}) ${branch}${isDefault ? chalk.green(' (default)') : ''}`,
    )
  })

  // Let user select by number or name
  const answer = await question(
    chalk.yellow(`\nEnter branch number or name (default: ${defaultBranch}): `),
  )

  // If answer is empty, return default
  if (!answer.trim()) {
    return defaultBranch
  }

  // If answer is a number, return corresponding branch
  const index = Number.parseInt(answer, 10) - 1
  if (!Number.isNaN(index) && index >= 0 && index < branches.length) {
    return branches[index]
  }

  // Check if answer matches any branch (case insensitive)
  const lowerAnswer = answer.trim().toLowerCase()
  const matchedBranch = branches.find(
    (branch) => branch.toLowerCase() === lowerAnswer,
  )

  if (matchedBranch) {
    return matchedBranch
  }

  // If no match found, filter branches containing the input
  const matchingBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(lowerAnswer),
  )

  if (matchingBranches.length === 1) {
    return matchingBranches[0]
  } else if (matchingBranches.length > 1) {
    console.log(chalk.cyan('\nMultiple matches found:'))
    matchingBranches.forEach((branch, index) => {
      console.log(`  ${index + 1}) ${branch}`)
    })

    const selection = await question(
      chalk.yellow('Enter branch number from the list above: '),
    )
    const selectedIndex = Number.parseInt(selection, 10) - 1

    if (
      !Number.isNaN(selectedIndex) &&
      selectedIndex >= 0 &&
      selectedIndex < matchingBranches.length
    ) {
      return matchingBranches[selectedIndex]
    }
  }

  // If still no valid selection, use default
  console.log(
    chalk.yellow(`No valid branch selected, using default: ${defaultBranch}`),
  )
  return defaultBranch
}

async function main() {
  try {
    console.log(chalk.bold.blue('\n=== Git Worktree Checkout Tool ==='))
    console.log(chalk.dim('Create a new worktree for branch development'))
    console.log(chalk.dim('------------------------------------------\n'))
    console.log(
      chalk.cyan(
        'ℹ️  This tool will help you set up a new worktree for working on the upgraded codebase.',
      ),
    )
    console.log(
      chalk.cyan('   Typically used after merging v4 into develop branch.\n'),
    )

    // Get worktree path (from CLI or prompt)
    let worktreePath = cliOptions.path
    if (!worktreePath) {
      worktreePath = await question(
        chalk.yellow(
          `Enter the worktree path (default: ${chalk.bold(defaultWorktreePath)}): `,
        ),
      )
    }
    worktreePath = worktreePath?.trim() || defaultWorktreePath

    // Validate that the path is in a parent directory
    const absoluteWorktreePath = path.resolve(worktreePath)
    const currentDir = path.resolve('.')

    if (!absoluteWorktreePath.startsWith(path.dirname(currentDir))) {
      console.error(
        chalk.red('Error: The worktree path must be in a parent directory.'),
      )
      rl.close()
      return
    }

    // Get branch (from CLI or interactive selection)
    let branch = cliOptions.branch
    if (!branch) {
      // Ask user how they want to select a branch
      const { selectionMethod } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectionMethod',
          message: 'How would you like to specify the branch?',
          choices: [
            { name: '搜索并选择分支 (支持打字搜索)', value: 'search' },
            { name: '从列表中选择 (上下键)', value: 'list' },
            { name: '手动输入分支名', value: 'manual' },
          ],
        },
      ])

      if (selectionMethod === 'manual') {
        branch = await enterBranchManually(defaultBranch)
      } else {
        // Get available branches
        console.log(chalk.dim('\nFetching available branches...'))
        const branches = await getAvailableBranches()

        // Use interactive selection or fallback based on environment
        try {
          if (selectionMethod === 'search') {
            branch = await selectBranchWithSearch(branches, defaultBranch)
          } else {
            branch = await selectBranchInteractive(branches, defaultBranch)
          }
        } catch (error) {
          console.log(
            chalk.yellow(
              `\nInteractive selection failed: ${error.message}\nFalling back to text-based menu.`,
            ),
          )
          branch = await selectBranchFallback(branches, defaultBranch)
        }
      }
    }

    console.log(
      chalk.blue(
        `\nChecking out branch '${chalk.bold(branch)}' to '${chalk.bold(worktreePath)}'...`,
      ),
    )

    // Check if worktree directory already exists
    if (fs.existsSync(worktreePath)) {
      console.error(
        chalk.red(
          `Error: Directory '${worktreePath}' already exists. Please choose another path.`,
        ),
      )
      rl.close()
      return
    }

    // Create git worktree
    await execPromise(`git worktree add ${worktreePath} ${branch}`)

    console.log(
      chalk.green(
        `\n✅ Successfully created worktree at '${chalk.bold(worktreePath)}' with branch '${chalk.bold(branch)}'`,
      ),
    )

    // Display next steps suggestions
    console.log(chalk.cyan('\nNext steps:'))
    console.log(chalk.cyan(`  cd ${worktreePath}`))
    console.log(chalk.cyan('  pnpm install'))
    console.log(chalk.cyan('  pnpm dev:daas # or another start command\n'))

    // Generate a copy-paste command for convenience
    const cdCommand = `cd ${worktreePath} && pnpm install`
    console.log(
      chalk.yellow(
        'Run the following command to navigate to the directory and install dependencies:',
      ),
    )
    console.log(chalk.bold(`  ${cdCommand}`))
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`))
  } finally {
    rl.close()
  }
}

main()

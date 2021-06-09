module.exports = {
	root: true,
	env: {
		node: true
	},
	extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
	parserOptions: {
		parser: 'babel-eslint'
	},
	rules: {
		'prettier/prettier': [
			'error',
			{
				// 使用space代替tab
				useTab: false,
				// 使用两个空格缩进
				tabWidth: 2,
				// 单引号
				singleQuote: true,
				// 取消尾分号
				semi: false,
				// 取消尾逗号
				trailingComma: 'none',
				// 统一换行符为\n
				endOfLine: 'lf'
			}
		],
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-unused-vars': 'off'
	}
}

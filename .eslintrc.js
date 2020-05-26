// https://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,
	parserOptions: {
		parser: 'babel-eslint',
		ecmaFeatures: true
	},
	env: {
		browser: true,
	},
	extends: [
		// https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
		// consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
		'standard',
		'plugin:vue/essential',
		// https://github.com/standard/standard/blob/master/docs/RULES-en.md
		'plugin:prettier/recommended',
	],
	// required to lint *.vue files
	plugins: [
		'vue'
	],
	// add your custom rules here
	rules: {
		"prettier/prettier": "error",
		// allow async-await
    	'generator-star-spacing': 'off',
		'no-new': 'off',
		'one-var': 'off',
		'standard/computed-property-even-spacing': 0,
		// allow debugger during development
    	'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
	}
};

// https://eslint.org/docs/user-guide/configuring

module.exports = {
	root: true,
	parserOptions: {
		parser: "babel-eslint",
		ecmaFeatures: true
	},
	env: {
		browser: true,
		node: true,
		es6: true
	},
	extends: [
		// https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
		// consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
		"plugin:vue/essential",
		// https://github.com/standard/standard/blob/master/docs/RULES-en.md
		"plugin:prettier/recommended",
		"eslint:recommended"
	],
	// required to lint *.vue files
	plugins: ["vue"],
	// add your custom rules here
	rules: {
		"prettier/prettier": [
			"error",
			{
				singleQuote: true,
				trailingComma: "none",
				bracketSpacing: true,
				jsxBracketSameLine: true
			}
		],
		// allow async-await
		"generator-star-spacing": "off",
		"no-new": "off",
		"one-var": "off",
		"no-control-regex": "off",
		"standard/computed-property-even-spacing": 0,
		// allow debugger during development
		"no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
		//'quotes': [1, 'single', 'backtick', 'double'],
		"no-console": ["error", { allow: ["warn"] }],
		"no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1 }],
		semi: [1, "always"],
		"no-undef": ["error"]
	}
};

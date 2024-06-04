module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		tsconfigRootDir: __dirname,
		sourceType: 'module',
	},

	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.cjs', 'node_modules/**/*', 'dist/**/*', 'jest.config.ts', 'cmdr.js'],
	rules: {
		"@typescript-eslint/no-explicit-any": 'off',
	}
	,
	settings: {
		'import/resolver': {
			alias: {
				extensions: ['.js', '.jsx', '.es6', '.coffee', '.ts'],
				paths: ['src', './src/**/*',  './lib/**', './utils/**/', './', './**', ],
				map: []
			},
		},
	},
	overrides: [
		{
			files: ['*.js, *.ts'],
			rules: {
				'import/no-unresolved': 'off', // Turned off during conversion to TS
				'import/no-cycle': 'off',
				'class-methods-use-this': 'off',
				'import/extensions': 'off',
				'import/prefer-default-export': 'off',
				'no-restricted-syntax': 'off',
				'no-use-before-define': 'off',
				'no-param-reassign': 'off',
				'no-underscore-dangle': 'off',
				'no-return-assign': 'off',
				'consistent-return': 'off',
				'no-continue': 'off',
			},
		},
	],
}

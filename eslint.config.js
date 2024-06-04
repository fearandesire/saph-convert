import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
	"eslint:recommended",
	{
		files: [ "**/*.ts" ],
		languageOptions: {
			parser: tsParser,
			globals: globals.node,
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			...tsPlugin.configs.recommended.rules,
			"no-console": "error",
		}
	},
	{
		files: [ "test/**/*.ts" ],
		languageOptions: {
			globals: globals.mocha,
		},
	},
];

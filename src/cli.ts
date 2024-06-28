#!/usr/bin/env node
import { Command } from 'commander'
import path from 'path'
import {
	overwriteOptionsDefaultValue,
	overwriteOptionsDescription,
	overwriteOptionsFlag,
	replaceOptionsDefaultValue,
	replaceOptionsDescription,
	replaceOptionsFlag,
} from './constants.js'
import { convertToTypeScript } from './functions/convertToTypescript.js'
import { findJavaScriptFiles } from './functions/findJavaScriptFiles.js'
import { readJavaScriptFile } from './functions/readJavaScriptFile.js'
import { saveTypeScriptFile } from './functions/saveToTypescript.js'
import { CommandOptions } from './lib/types.js'
import Logger from './utils/Logger.js'

const cli = new Command()

cli.name('saph-convert')
	.description('CLI tool to convert Sapphire.js command files from JS to TS')
	.version('1.0.0')

cli.option(
	replaceOptionsFlag,
	replaceOptionsDescription,
	replaceOptionsDefaultValue,
)

cli.option(
	overwriteOptionsFlag,
	overwriteOptionsDescription,
	overwriteOptionsDefaultValue,
)

cli.command('cf')
	.description('Convert a specific JS command file to TS')
	.argument('<inputFile>', 'Path to the JS command file to convert')
	.argument(
		'[outputPath]',
		'Output path for the TS file. Defaults to same directory as input file.',
	)
	.addHelpText(
		'afterAll',
		`\nExample:\n  $ saph-convert cf src/commands/myCommand.js [dist/commands/myCommand]\n`,
	)
	.action(async (inputFile: string, outputPath?: string) => {
		const options = cli.opts<CommandOptions>()
		await convertFile(
			inputFile,
			outputPath,
			options.overwrite,
			options.replace,
		)
	})

cli.command('cdir')
	.description(
		'Recursively convert all JS command files in a directory to TS',
	)
	.argument(
		'<directory>',
		'Directory containing Sapphire.js JS command files to convert to TS. ❗ Be cautious: this will blindly convert by the `.js` extension in the directory',
	)
	.argument(
		'[outputDirectory]',
		'Output directory for the TS files. Defaults to same directory as input.',
	)
	.addHelpText(
		'afterAll',
		`\nExample:\n  $ saph-convert cdir src/commands [dist/commands]\n`,
	)
	.action(async (inputDirectory: string, outputDirectory?: string) => {
		const options = cli.opts<CommandOptions>()
		await convertDirectory(
			options.overwrite,
			options.replace,
			inputDirectory,
			outputDirectory,
		)
	})

if (!process.argv.slice(2).length) {
	cli.outputHelp()
}

cli.parse(process.argv)

/**
 * Converts a specific JavaScript file to TypeScript.
 *
 * @param {string} inputFile - The JavaScript file to convert.
 * @param {string} outputPath - The output path for the TypeScript file.
 * @param {boolean} overwrite - Whether to overwrite existing files.
 * @param {boolean} replace - Whether to delete the original JavaScript file after conversion.
 */

async function convertFile(
	inputFile: string,
	outputPath?: string,
	overwrite: boolean = true,
	replace: boolean = false,
) {
	try {
		const jsCode = await readJavaScriptFile(inputFile)
		const tsCode = convertToTypeScript(jsCode)
		if (!outputPath) {
			outputPath = path.join(
				path.dirname(inputFile),
				path.basename(inputFile, '.js'),
			)
		}
		await saveTypeScriptFile(tsCode, outputPath, overwrite, replace)
		Logger.info(`Cmd converted & saved to ${outputPath}`)
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error(`Error: ${error.message}`)
		} else {
			Logger.error(`Unexpected error occurred`)
		}
	}
}
/**
 * Recursively converts all JavaScript files in a directory to TypeScript.
 *
 * @param {string} inputDirectory - The directory containing JavaScript files to convert.
 * @param outputDirectory - The output directory for the TypeScript files.
 * @param {boolean} overwrite - Whether to overwrite existing files.
 * @param {boolean} replace - Whether to delete the original JavaScript file after conversion.
 */
async function convertDirectory(
	overwrite: boolean,
	replace: boolean,
	inputDirectory: string,
	outputDirectory?: string,
) {
	try {
		const jsFiles = await findJavaScriptFiles(inputDirectory)
		const totalFiles = jsFiles.length
		if (totalFiles === 0) {
			Logger.error(
				`No JavaScript files found in directory ${inputDirectory}.`,
			)
			return
		} else {
			Logger.info(
				`Converting ${totalFiles} JavaScript files to TypeScript...`,
			)
		}
		for (const jsFile of jsFiles) {
			const relativePath = path.relative(inputDirectory, jsFile)
			const outputPath = outputDirectory
				? path.join(
						outputDirectory,
						relativePath.replace(/\.js$/, '.ts'),
					)
				: jsFile.replace(/\.js$/, '.ts')
			const jsCode = await readJavaScriptFile(jsFile)
			const tsCode = convertToTypeScript(jsCode)
			await saveTypeScriptFile(tsCode, outputPath, overwrite, replace)
		}
		Logger.info(`Completed TS conversion!`)
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error(`Error: ${error.message}`)
		} else {
			Logger.error(`Unexpected error occurred`)
		}
	}
}

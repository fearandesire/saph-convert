#!/usr/bin/env node
import { Command } from 'commander'
import { promises as fs } from 'fs'
import path from 'path'
import {
	ClassDeclaration,
	ConstructorDeclaration,
	MethodDeclaration,
	Project,
	Scope,
	SourceFile,
} from 'ts-morph'
import Logger from './utils/Logger.js'

const cli = new Command()

cli.name('saph-convert')
	.description('CLI tool to convert Sapphire.js command files from JS to TS')
	.version('1.0.0')

cli.option(
	'-r, --replace',
	'Replace original JS command files with converted TypeScript files. Default: Disabled',
).option(
	'-o, --overwrite',
	'Overwrite existing TypeScript files. Default: Enabled',
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
		const options = cli.opts()
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
		const options = cli.opts()
		await convertDirectory(
			inputDirectory,
			outputDirectory,
			options.overwrite,
			options.replace,
		)
	})

if (!process.argv.slice(2).length) {
	cli.outputHelp()
}

cli.parse(process.argv)

/**
 * Reads a JavaScript file from the given path.
 *
 * @param {string} inputFile - The path to the input JavaScript file.
 * @returns {Promise<string>} The content of the JavaScript file.
 */
async function readJavaScriptFile(inputFile: string): Promise<string> {
	if (!inputFile.endsWith('.js')) {
		inputFile += '.js'
	}
	return fs.readFile(inputFile, 'utf-8')
}

/**
 * Converts JavaScript code to TypeScript code using several transformation methods
 *
 * @param {string} jsCode - The JavaScript code to convert.
 * @returns {string} The converted TypeScript code.
 */
function convertToTypeScript(jsCode: string): string {
	const project = new Project()
	const sourceFile = project.createSourceFile('temp.ts', jsCode)

	transformClasses(sourceFile)
	transformFunctions(sourceFile)
	transformMethods(sourceFile)

	addApplyOptionsImport(sourceFile)

	return sourceFile.getText()
}

/**
 * Transforms the classes in the source file.
 *
 * @param {SourceFile} sourceFile - The source file containing the classes to transform.
 */
function transformClasses(sourceFile: SourceFile) {
	sourceFile.getClasses().forEach((cls) => {
		cls.rename('UserCommand')

		const constructor = cls.getConstructors()[0]
		if (constructor) {
			const description = getDescriptionFromConstructor(constructor)
			if (description) {
				addApplyOptionsDecorator(cls, description)
			}
			constructor.remove()
		}
	})
}

/**
 * Extracts the description from the constructor parameters using regex.
 * Used for {@link addApplyOptionsDecorator ApplyOptions decorator}.
 * @param {any} constructor - The constructor to extract the description from.
 * @returns {string | undefined} The description if found, otherwise undefined.
 */
function getDescriptionFromConstructor(
	constructor: ConstructorDeclaration,
): string | undefined {
	const constructorText = constructor.getText().replace(/\t/g, '')
	const descriptionMatch = constructorText.match(
		/description:\s*['"](.+?)['"]/,
	)

	if (!descriptionMatch) {
		return undefined
	}

	const descriptionValue = descriptionMatch[1]

	return descriptionValue
}

/**
 * Adds the `@ApplyOptions` decorator to the class with the existing description from the command constructor.
 *
 * @param {any} cls - The class to add the decorator to.
 * @param {string} description - The description to use in the decorator.
 */
function addApplyOptionsDecorator(cls: ClassDeclaration, description: string) {
	cls.addDecorator({
		name: 'ApplyOptions',
		arguments: [`<Command.Options>{ description: "${description}" }`],
	})
}

/**
 * Transforms the functions in the source file by setting their return type to Promise<void>.
 *
 * @param {SourceFile} sourceFile - The source file containing the functions to transform.
 */
function transformFunctions(sourceFile: SourceFile) {
	sourceFile.getFunctions().forEach((func) => {
		if (
			func.getName() === 'registerApplicationCommands' ||
			func.getName() === 'chatInputRun'
		) {
			func.setReturnType('Promise<void>')
		}
	})
}

/**
 * Utility function to set scope and override keyword on methods.
 *
 * Intended to be anonymously used but it's currently intended for `registerApplicationCommands` and `chatInputRun`.
 *
 * @param {MethodDeclaration} method - The method to transform.
 * @param {{prefix?: true}} args - Arguments to specify transformation options.
 * @returns {MethodDeclaration} The transformed method.
 */
function methodTransUtil(
	method: MethodDeclaration,
	args: { prefix?: true },
): MethodDeclaration {
	if (args.prefix) {
		method.setScope(Scope.Public)
		method.setHasOverrideKeyword(true)
	}
	return method
}

/**
 * Utility function to set parameter types on methods based on a predefined mapping.
 *
 * @param {MethodDeclaration} method - The method to transform.
 * @param {{prefix?: true}} args - Arguments to specify transformation options.
 * @returns {MethodDeclaration} The transformed method.
 */
function paramTypeUtils(
	method: MethodDeclaration,
	args: { prefix?: true },
): MethodDeclaration {
	const paramTypes: { [key: string]: string } = {
		registry: 'Command.Registry',
		interaction: 'Command.ChatInputCommandInteraction',
	}
	if (args.prefix) {
		// Ensure we target `registry` param
		const parameter = method.getParameters()
		parameter.forEach((param) => {
			const paramName = param.getName()
			if (paramTypes[paramName]) {
				param.setType(paramTypes[paramName])
			}
		})
	}
	return method
}

/**
 * Transforms the methods in the source file by setting their parameter types and adding the scope and override keyword.
 *
 * @param {SourceFile} sourceFile - The source file containing the methods to transform.
 */
function transformMethods(sourceFile: SourceFile) {
	const methodsToTransform = ['registerApplicationCommands', 'chatInputRun']
	sourceFile.getClasses().forEach((cls) => {
		cls.getMethods().forEach((method) => {
			if (methodsToTransform.includes(method.getName())) {
				methodTransUtil(method, { prefix: true })
				paramTypeUtils(method, { prefix: true })
			}
		})
	})
}

/**
 *
 * @param {SourceFile} sourceFile - The source file to check and modify.
 */
function addApplyOptionsImport(sourceFile: SourceFile) {
	const applyOptionsUsed = sourceFile
		.getClasses()
		.some((cls) =>
			cls.getDecorators().some((dec) => dec.getName() === 'ApplyOptions'),
		)

	if (applyOptionsUsed) {
		sourceFile.addImportDeclaration({
			moduleSpecifier: '@sapphire/decorators',
			namedImports: ['ApplyOptions'],
		})
	}
}

/**
 * Saves the TypeScript code to the specified output path.
 *
 * @param {string} tsCode - The TypeScript code to save.
 * @param {string} outputPath - The path to save the TypeScript file, including the directory and file name without extension.
 * @param {boolean} overwrite - Whether to overwrite existing files.
 * @param {boolean} replace - Whether to delete the original JavaScript file after conversion.
 */
async function saveTypeScriptFile(
	tsCode: string,
	outputPath: string,
	overwrite: boolean,
	replace: boolean,
) {
	const outputDir = path.dirname(outputPath)
	const outputFileName =
		path.basename(outputPath, path.extname(outputPath)) + '.ts'

	await fs.mkdir(outputDir, { recursive: true })
	const outputFilePath = path.join(outputDir, outputFileName)

	if (!overwrite) {
		try {
			await fs.access(outputFilePath)
			Logger.warn(`File ${outputFilePath} already exists. Skipping.`)
			return
		} catch {
			// File does not exist, proceed with writing
		}
	}

	await fs.writeFile(outputFilePath, tsCode)
	if (replace) {
		try {
			await fs.unlink(outputFilePath.replace(/\.ts$/, '.js'))
		} catch (error: unknown) {
			if (error instanceof Error) {
				Logger.error(
					`Error deleting original JavaScript file: ${error.message}`,
				)
			} else {
				Logger.error(
					`Unexpected error occurred while deleting original JavaScript file`,
				)
			}
		}
	}
}

/**
 * Finds all JavaScript files in a directory recursively.
 *
 * @param {string} directory - The directory to search for JavaScript files.
 * @returns {Promise<string[]>} A list of JavaScript file paths.
 */
async function findJavaScriptFiles(directory: string): Promise<string[]> {
	let jsFiles: string[] = []
	const items = await fs.readdir(directory, { withFileTypes: true })

	for (const item of items) {
		const fullPath = path.join(directory, item.name)
		if (item.isDirectory()) {
			jsFiles = jsFiles.concat(await findJavaScriptFiles(fullPath))
		} else if (item.isFile() && fullPath.endsWith('.js')) {
			jsFiles.push(fullPath)
		}
	}

	return jsFiles
}

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
	inputDirectory: string,
	outputDirectory?: string,
	overwrite: boolean = true,
	replace: boolean = false,
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

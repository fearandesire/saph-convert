import { Command } from 'commander'
import { promises as fs } from 'fs'
import path from 'path'
import { MethodDeclaration, Project, Scope, SourceFile } from 'ts-morph'
import Logger from './utils/Logger.js'

const program = new Command()

program
	.name('convert-cli')
	.description('CLI to convert Sapphire.js command files from JS to TS')
	.version('1.0.0')

program
	.command('convert-file')
	.description('Convert a specific JavaScript file to TypeScript')
	.argument('<inputFile>', 'Input JavaScript file to convert')
	.argument(
		'<outputPath>',
		'Output path including directory and TypeScript file name (without extension)',
	)
	.action(async (inputFile: string, outputPath: string) => {
		try {
			const jsCode = await readJavaScriptFile(inputFile)
			const tsCode = convertToTypeScript(jsCode)
			await saveTypeScriptFile(tsCode, outputPath)
			console.log(`File converted and saved to ${outputPath}`)
		} catch (error: any) {
			console.error(`Error: ${error.message}`)
		}
	})

program
	.command('convert-directory')
	.description(
		'Recursively convert all JavaScript files in a directory to TypeScript',
	)
	.argument(
		'<inputDirectory>',
		'Directory containing JavaScript files to convert',
	)
	.action(async (inputDirectory: string) => {
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
				const outputPath = jsFile.replace(/\.js$/, '.ts')
				const jsCode = await readJavaScriptFile(jsFile)
				const tsCode = convertToTypeScript(jsCode)
				await saveTypeScriptFile(tsCode, outputPath)
				await fs.unlink(jsFile)
			}
			Logger.info(`Completed TS conversion!`)
		} catch (error: any) {
			console.error(`Error: ${error.message}`)
		}
	})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
	program.outputHelp()
}
// Modules below
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
 * Extracts the description from the constructor parameters.
 * Used for {@link addApplyOptionsDecorator ApplyOptions decorator}.
 * @param {any} constructor - The constructor to extract the description from.
 * @returns {string | undefined} The description if found, otherwise undefined.
 */
function getDescriptionFromConstructor(constructor: any): string | undefined {
	return constructor
		.getParameters()[1]
		.getType()
		.getProperties()
		.find((prop: any) => prop.getName() === 'description')
		?.getValueDeclaration()
		?.getText()
}

/**
 * Adds the `@ApplyOptions` decorator to the class with the existing description from the command constructor.
 *
 * @param {any} cls - The class to add the decorator to.
 * @param {string} description - The description to use in the decorator.
 */
function addApplyOptionsDecorator(cls: any, description: string) {
	cls.addDecorator({
		name: 'ApplyOptions',
		arguments: [`<Command.Options>({ description: ${description} })`],
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
 * Saves the TypeScript code to the specified output path.
 *
 * @param {string} tsCode - The TypeScript code to save.
 * @param {string} outputPath - The path to save the TypeScript file, including the directory and file name without extension.
 */
async function saveTypeScriptFile(tsCode: string, outputPath: string) {
	const outputDir = path.dirname(outputPath)
	const outputFileName =
		path.basename(outputPath, path.extname(outputPath)) + '.ts'

	await fs.mkdir(outputDir, { recursive: true })
	const outputFilePath = path.join(outputDir, outputFileName)
	await fs.writeFile(outputFilePath, tsCode)
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

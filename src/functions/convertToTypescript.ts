import {
	ClassDeclaration,
	ConstructorDeclaration,
	MethodDeclaration,
	Project,
	Scope,
	SourceFile,
} from 'ts-morph'

/**
 * Converts JavaScript code to TypeScript code using several transformation methods
 *
 * @param {string} jsCode - The JavaScript code to convert.
 * @returns {string} The converted TypeScript code.
 */
export function convertToTypeScript(jsCode: string): string {
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
		arguments: [`{ description: "${description}" }`],
		typeArguments: ['Command.Options'],
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

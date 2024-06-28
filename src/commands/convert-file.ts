import path from 'path'
import { cli } from '../cli'
import { convertToTypeScript } from '../functions/convertToTypescript'
import { readJavaScriptFile } from '../functions/readJavaScriptFile'
import { saveTypeScriptFile } from '../functions/saveToTypescript'
import { CommandOptions } from '../lib/types'
import Logger from '../utils/Logger'

/**
 * Converts a specific JavaScript file to TypeScript.
 *
 * @param {string} inputFile - The JavaScript file to convert.
 * @param {string} outputPath - The output path for the TypeScript file.
 */
export const convertFile = async (
	inputFile: string,
	outputPath?: string,
): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>()
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

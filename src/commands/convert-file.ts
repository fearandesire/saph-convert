import { convertToTypeScript } from '#functions/convertToTypescript';
import { saveTypeScriptFile } from '#functions/saveToTypescript';
import Logger from '#lib/Logger';
import type { CommandOptions } from '#lib/types';
import { appendJSExtension } from '#lib/utils';
import { cli } from '#root/cli';
import { readFile } from 'node:fs/promises';

/**
 * Converts the specified JavaScript file to TypeScript.
 *
 * @param {string} sourceFile - The JavaScript file to convert.
 * @param {string} [targetDirectory] - The path to save the TypeScript file.
 */
export const convertFile = async (sourceFile: string, targetDirectory?: string): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>();

	try {
		Logger.info(`Converting ${sourceFile}...`);

		const javascriptFileCode = await readFile(appendJSExtension(sourceFile), 'utf-8');
		const typescriptCode = convertToTypeScript(javascriptFileCode);

		const convertedFilePath = targetDirectory ?? sourceFile;

		await saveTypeScriptFile(typescriptCode, convertedFilePath, overwrite, replace);

		Logger.info(`Converted & saved to ${convertedFilePath}`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error(`Error: ${error.message}`);
		} else {
			Logger.error(`Unexpected error occurred`);
		}
	}
};

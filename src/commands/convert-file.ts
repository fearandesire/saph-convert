import { convertToTypeScript } from '#functions/convertToTypescript';
import { saveTypeScriptFile } from '#functions/saveToTypescript';
import Logger from '#lib/Logger';
import type { CommandOptions } from '#lib/types';
import { appendJSExtension } from '#lib/utils';
import { cli } from '#root/cli';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Converts a specific JavaScript file to TypeScript.
 *
 * @param {string} inputFile - The JavaScript file to convert.
 * @param {string} outputPath - The output path for the TypeScript file.
 */
export const convertFile = async (inputFile: string, outputPath?: string): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>();
	try {
		const jsCode = await readFile(appendJSExtension(inputFile), 'utf-8');
		const tsCode = convertToTypeScript(jsCode);
		if (!outputPath) {
			outputPath = path.join(path.dirname(inputFile), path.basename(inputFile, '.js'));
		}
		await saveTypeScriptFile(tsCode, outputPath, overwrite, replace);
		Logger.info(`Cmd converted & saved to ${outputPath}`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error(`Error: ${error.message}`);
		} else {
			Logger.error(`Unexpected error occurred`);
		}
	}
};

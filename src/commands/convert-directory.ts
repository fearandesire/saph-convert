import { convertToTypeScript } from '#functions/convertToTypescript';
import { findFilesRecursivelyStringEndsWith } from '#functions/findFilesRecursively';
import { saveTypeScriptFile } from '#functions/saveToTypescript';
import Logger from '#lib/Logger';
import type { CommandOptions } from '#lib/types';
import { appendJSExtension } from '#lib/utils';
import { cli } from '#root/cli';
import { readFile } from 'node:fs/promises';

/**
 * Converts all JavaScript files in the specified directory to TypeScript.
 *
 * @param {string} sourceDirectory - The directory containing JavaScript files to convert.
 * @param {string} [targetDirectory] - The directory to save the TypeScript files.
 */
export const convertDirectory = async (sourceDirectory: string, targetDirectory?: string): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>();

	try {
		const filteredJsFiles = await Array.fromAsync(findFilesRecursivelyStringEndsWith(sourceDirectory, '.js'));
		if (filteredJsFiles.length === 0) Logger.error(`No JavaScript files found in directory ${sourceDirectory}.`);

		Logger.info(`Found ${filteredJsFiles.length} JavaScript files to convert.`);

		for (const javascriptFile of filteredJsFiles) {
			Logger.info(`Converting ${javascriptFile}...`);

			const javascriptFileCode = await readFile(appendJSExtension(javascriptFile), 'utf-8');
			const typescriptCode = convertToTypeScript(javascriptFileCode);

			const targetDirectoryPath = targetDirectory ?? sourceDirectory;

			await saveTypeScriptFile(typescriptCode, targetDirectoryPath, overwrite, replace);

			Logger.info(`Converted & saved to ${targetDirectoryPath}`);
		}
		Logger.info(`Completed TS conversion!`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			Logger.error(`Error: ${error.message}`);
		} else {
			Logger.error(`Unexpected error occurred`);
		}
	}

	process.exit(0);
};

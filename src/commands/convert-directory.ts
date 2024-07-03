import { convertToTypeScript } from '#functions/convertToTypescript';
import { findFilesRecursivelyStringEndsWith } from '#functions/findFilesRecursively';
import { saveTypeScriptFile } from '#functions/saveToTypescript';
import Logger from '#lib/Logger';
import type { CommandOptions } from '#lib/types';
import { appendJSExtension } from '#lib/utils';
import { cli } from '#root/cli';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Recursively converts all JavaScript files in a directory to TypeScript.
 *
 * @param {string} inputDirectory - The directory containing JavaScript files to convert.
 * @param outputDirectory - The output directory for the TypeScript files.
 */
export const convertDirectory = async (inputDirectory: string, outputDirectory?: string): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>();
	try {
		const foundFiles = await Array.fromAsync(findFilesRecursivelyStringEndsWith(inputDirectory, '.js'));
		if (foundFiles.length === 0) Logger.error(`No JavaScript files found in directory ${inputDirectory}.`);

		Logger.info(`Converting ${foundFiles.length} JavaScript files to TypeScript...`);

		for (const jsFile of foundFiles) {
			const relativePath = path.relative(inputDirectory, jsFile);
			const outputPath = outputDirectory ? path.join(outputDirectory, relativePath.replace(/\.js$/, '.ts')) : jsFile.replace(/\.js$/, '.ts');
			const jsCode = await readFile(appendJSExtension(jsFile), 'utf-8');
			const tsCode = convertToTypeScript(jsCode);
			await saveTypeScriptFile(tsCode, outputPath, overwrite, replace);
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

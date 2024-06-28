import { convertToTypeScript, findJavaScriptFiles, readJavaScriptFile, saveTypeScriptFile } from '#functions';
import type { CommandOptions } from '#lib/types';
import { cli } from '../cli.js';
import path from 'path';
import Logger from '../lib/Logger.js';

/**
 * Recursively converts all JavaScript files in a directory to TypeScript.
 *
 * @param {string} inputDirectory - The directory containing JavaScript files to convert.
 * @param outputDirectory - The output directory for the TypeScript files.
 */
export const convertDirectory = async (inputDirectory: string, outputDirectory?: string): Promise<void> => {
	const { overwrite, replace } = cli.opts<CommandOptions>();
	try {
		const jsFiles = await findJavaScriptFiles(inputDirectory);
		const totalFiles = jsFiles.length;
		if (totalFiles === 0) {
			Logger.error(`No JavaScript files found in directory ${inputDirectory}.`);
			return;
		}
		Logger.info(`Converting ${totalFiles} JavaScript files to TypeScript...`);

		for (const jsFile of jsFiles) {
			const relativePath = path.relative(inputDirectory, jsFile);
			const outputPath = outputDirectory ? path.join(outputDirectory, relativePath.replace(/\.js$/, '.ts')) : jsFile.replace(/\.js$/, '.ts');
			const jsCode = await readJavaScriptFile(jsFile);
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
};

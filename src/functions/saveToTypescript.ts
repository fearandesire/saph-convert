import Logger from '#lib/Logger';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Saves the TypeScript code to the specified output path.
 *
 * @param {string} tsCode - The TypeScript code to save.
 * @param {string} outputPath - The path to save the TypeScript file, including the directory and file name without extension.
 * @param {boolean} overwrite - Whether to overwrite existing files.
 * @param {boolean} replace - Whether to delete the original JavaScript file after conversion.
 */
export async function saveTypeScriptFile(tsCode: string, outputPath: string, overwrite: boolean, replace: boolean) {
	const outputDir = path.dirname(outputPath);
	const outputFileName = `${path.basename(outputPath, path.extname(outputPath))}.ts`;

	await mkdir(outputDir, { recursive: true });
	const outputFilePath = path.join(outputDir, outputFileName);

	if (!overwrite) {
		try {
			await access(outputFilePath);
			Logger.warn(`File ${outputFilePath} already exists. Skipping.`);
			return;
		} catch {
			// File does not exist, proceed with writing
		}
	}

	await writeFile(outputFilePath, tsCode);
	if (replace) {
		try {
			await unlink(outputFilePath.replace(/\.ts$/, '.js'));
		} catch (error: unknown) {
			if (error instanceof Error) {
				Logger.error(`Error deleting original JavaScript file: ${error.message}`);
			} else {
				Logger.error(`Unexpected error occurred while deleting original JavaScript file`);
			}
		}
	}
}

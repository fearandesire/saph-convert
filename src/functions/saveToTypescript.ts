import Logger from '#lib/Logger';
import { Result } from '@sapphire/result';
import { access, unlink, writeFile } from 'node:fs/promises';
/**
 * Saves the TypeScript code to the specified output path.
 *
 * @param {string} tsCode - The TypeScript code to save.
 * @param {string} outputPath - The path to save the TypeScript file, including the directory and file name without extension.
 * @param {boolean} overwrite - Whether to overwrite existing files.
 * @param {boolean} replace - Whether to delete the original JavaScript file after conversion.
 */
export async function saveTypeScriptFile(tsCode: string, outputPath: string, overwrite: boolean, replace: boolean) {
	const outputFilePath = outputPath.replace(/\.js$/, '.ts');

	if (!overwrite && (await fileExists(outputFilePath))) {
		Logger.error(`File ${outputFilePath} already exists. Use the --overwrite flag to overwrite the file.`);
		return;
	}

	if (replace) await unlink(outputPath);

	await writeFile(outputFilePath, tsCode);

	Logger.info(`Saved TypeScript file to ${outputFilePath}`);
}

async function fileExists(path: string): Promise<boolean> {
	const result = await Result.fromAsync(access(path));

	return result.isOk();
}

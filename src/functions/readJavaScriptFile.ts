import { readFile } from 'node:fs/promises';

/**
 * Reads a JavaScript file from the given path.
 *
 * @param {string} inputFile - The path to the input JavaScript file.
 * @returns {Promise<string>} The content of the JavaScript file.
 */
export async function readJavaScriptFile(inputFile: string): Promise<string> {
	if (!inputFile.endsWith('.js')) {
		inputFile += '.js';
	}
	return readFile(inputFile, 'utf-8');
}

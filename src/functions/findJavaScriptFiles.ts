import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Finds all JavaScript files in a directory recursively.
 *
 * @param {string} directory - The directory to search for JavaScript files.
 * @returns {Promise<string[]>} A list of JavaScript file paths.
 */
export async function findJavaScriptFiles(directory: string): Promise<string[]> {
	let jsFiles: string[] = [];
	const items = await readdir(directory, { withFileTypes: true });

	for (const item of items) {
		const fullPath = join(directory, item.name);
		if (item.isDirectory()) {
			jsFiles = jsFiles.concat(await findJavaScriptFiles(fullPath));
		} else if (item.isFile() && fullPath.endsWith('.js')) {
			jsFiles.push(fullPath);
		}
	}

	return jsFiles;
}

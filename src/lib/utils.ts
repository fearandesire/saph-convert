/**
 * Appends a `.js` extension to the input file if it does not already have one.
 *
 * @param {string} inputFile - The input file.
 * @returns {string} The input file with a `.js` extension.
 */
export function appendJSExtension(inputFile: string): string {
	return inputFile.endsWith('.js') ? inputFile : `${inputFile}.js`;
}

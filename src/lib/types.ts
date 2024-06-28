/**
 * Represents the options for a command.
 */
export interface CommandOptions {
	/**
	 * Whether to overwrite existing TypeScript files.
	 * @default true
	 */
	overwrite: boolean;
	/**
	 * Whether to replace original JS command files with converted TypeScript files.
	 * @default false
	 */
	replace: boolean;
}

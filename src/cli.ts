#!/usr/bin/env node
import { convertDirectory } from '#commands/convert-directory';
import { convertFile } from '#commands/convert-file';
import {
	overwriteOptionsDefaultValue,
	overwriteOptionsDescription,
	overwriteOptionsFlag,
	replaceOptionsDefaultValue,
	replaceOptionsDescription,
	replaceOptionsFlag
} from '#constants';
import { Command } from 'commander';

export const cli = new Command();

cli.name('saph-convert').description('CLI tool to convert Sapphire.js command files from JS to TS').version('1.0.0');

cli.option(replaceOptionsFlag, replaceOptionsDescription, replaceOptionsDefaultValue);

cli.option(overwriteOptionsFlag, overwriteOptionsDescription, overwriteOptionsDefaultValue);

cli.command('convert-file')
	.aliases(['cf', 'file', 'f'])
	.description('Convert a specific JS command file to TS')
	.argument('<inputFile>', 'Path to the JS command file to convert')
	.argument('[outputPath]', 'Output path for the TS file. Defaults to same directory as input file.')
	.addHelpText('afterAll', `\nExample:\n  $ saph-convert cf src/commands/myCommand.js [dist/commands/myCommand]\n`)
	.action(convertFile);

cli.command('convert-directory')
	.aliases(['cd', 'directory', 'd'])
	.description('Recursively convert all JS command files in a directory to TS')
	.argument(
		'<directory>',
		'Directory containing Sapphire.js JS command files to convert to TS. ❗ Be cautious: this will blindly convert by the `.js` extension in the directory'
	)
	.argument('[outputDirectory]', 'Output directory for the TS files. Defaults to same directory as input.')
	.addHelpText('afterAll', `\nExample:\n  $ saph-convert cdir src/commands [dist/commands]\n`)
	.action(convertDirectory);

cli.parse(process.argv);

# saph-convert

![saph-convert](https://img.shields.io/badge/saph--convert-v1.0.0-blue)

CLI tool to convert [Sapphire.js](https://sapphirejs.dev/) command files from JavaScript to TypeScript.

## Example
For straight-forward usage:
```bash
saph-convert cf ./src/commands/ping.js
```

## Installation

```bash
# with npm
npm install -g saph-convert
# with yarn
yarn global add saph-convert
```

## Usage
### Global Options
`-r` or `--replace` - Replace original JS command file(s) with converted TypeScript files. **_Default: Enabled_**

`-o` or `--overwrite` - Overwrite existing TS file. E.g, `commands/ping.ts` is overwritten with the newly-converted `commands/ping.ts` **_Default: Enabled_**


### cf
Converts a specified command file to TypeScript.

🧠 **Command Args:** saph-convert cf `<inputFile>` `<outputPath>`

**The original JS command file will be left untouched unless -r or --replace is specified.**


- `<inputFile>`: Path to the input JavaScript file to convert.
- `[outputPath]` (optional): Path where the converted TypeScript file will be saved.

When `<outputPath>` is not specified, the output will be saved to the same directory as the input file.
Additionally, you do not need to add the `.ts` extension to the output file name.

**Example:**
```bash
# Converts the cmd, and it goes right back to the same directory
saph-convert cf ./src/commands/owner/eval.js
```

### cdir
Recursively converts all command files in a directory to TypeScript.

🧠 **Command Syntax:** `saph-convert cdir <directory> <outputPath>`

> ⚠️ **Note:** Currently, this library will check for all .js files. Only use this in a directory that strictly contains command files

- `<directory>`: Path to the input directory containing JavaScript command files to convert.
- `[outputPath]` _(optional)_: Output path where the converted TypeScript files will be saved.

As with `cf`, if `[outputPath]` is not specified, the output will be saved to the same directory as the input.

**Example:**
```bash
# Converts all .js files in the commands directory
saph-convert cdir ./src/commands
```

## Conversion Example
To make you aware of the expected capabilities of `saph-convert`, here's an example `ping` command
```js 
// src/commands/ping.js
import { Command } from '@sapphire/framework'

export class PingCommand extends Command {
	constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: 'ping',
			description: 'Responds with Pong!',
			chatInputCommand: {
				register: true,
			},
		})
	}

	registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('ping')
					.setDescription(this.description),
		)
	}

	async chatInputRun(interaction: Command.ChatInputInteraction) {
		await interaction.reply('Pong!')
	}
}
```

**Output:**
```ts
import { Command } from '@sapphire/framework'

@ApplyOptions(<Command.Options>{ description: "Responds with Pong!" })
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand(
			(builder) =>
				builder //
					.setName('ping')
					.setDescription(this.description),
		)
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.reply('Pong!')
	}
}
```

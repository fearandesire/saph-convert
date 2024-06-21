# [saph-convert](https://github.com/fearandesire/saph-convert)

![saph-convert](https://img.shields.io/npm/v/saph-convert)

CLI tool to effortlessly convert [Sapphire.js](https://sapphirejs.dev/) command files from JavaScript to TypeScript.

## Example
Straight-forward usage:
```bash
saph-convert cf ./src/commands/ping.js
```

## Table of Contents
- [Example](#example)
- [Install](#install)
- [Usage](#usage)
    - [Global Options](#global-options)
    - [Commands](#commands)
- [Conversion Example](#conversion-example)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)


# Install

```bash
# with npm
npm install -g saph-convert
# with yarn
yarn global add saph-convert
```

# Usage
## Global Options
`-r` or `--replace` - Replace original JS command file(s) with converted TypeScript files. **_Default: Enabled_**

`-o` or `--overwrite` - Overwrite existing TS file. **_Default: Enabled_**


## Commands

`cf <inputFile> [outputPath]`: Convert a single command file.

`cdir <directory> [outputPath]`: Recursively convert all command files within a directory.

### **Examples:**
```bash
saph-convert cf ./src/commands/ping.js
saph-convert cdir ./src/commands
```
> ⚠️ When using `cdir`, this library will convert all .js files in the directory. Only use this in a directory that strictly contains command files

> **Note:** In the instance of an existing `.ts` file with the same name, the tool will not overwrite it unless `-o` is provided.

# Conversion Example
**Input:**
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

# Dependencies
- [ansis](https://www.npmjs.com/package/ansis)
- [commander](https://www.npmjs.com/package/commander)
- [ts-morph](https://www.npmjs.com/package/ts-morph)

# Contributing
Contributions are welcome! Please open an issue or submit a pull request for any bugs or feature requests.

# License
[MIT License](LICENSE)
<div align="center">

# [saph-convert](https://github.com/fearandesire/saph-convert)

**A CLI tool to convert Sapphire Framework command files from JavaScript to TypeScript.**

[![GitHub](https://img.shields.io/github/license/fearandesire/saph-convert?style=flat-square)](https://github.com/fearandesire/cli/blob/main/LICENSE.md)
[![npm](https://img.shields.io/npm/v/saph-convert?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/saph-convert)

</div>

## Table of Contents

-   [Table of Contents](#table-of-contents)
-   [Description](#description)
-   [Features](#features)
-   [Usage](#usage)
    -   [Global Options](#global-options)
    -   [Commands](#commands)
-   [Conversion Exemples](#conversion-exemples)
    -   [Input](#input)
    -   [Output](#output)
-   [Contributors](#contributors)

## Description

[Back to top][toc]

✨ Transform your Sapphire commands from JS to TS with this simple CLI tool! Convert single files or entire directories with ease.

> **Note:** This tool is only designed to work with Sapphire Framework command files.

## Features

[Back to top][toc]

-   Convert Sapphire JS commands to TS
-   Transform single command files or directories
-   Easily replace the original JS file in the same process

## Installation

[Back to top][toc]

```bash
npm install -g saph-convert
```

Or directly use the CLI tool directly via `npx`

```bash
npx saph-convert <command> [options]
```

### Basic usage

Convert single file:

```bash
npx saph-convert cf <file> [ouptutDirectory] [options]
```

Convert all files in a directory:

```bash
npx saph-convert cdir <directory> [ouptutDirectory] [options]
```

### Global Options

-   `-o, --overwrite`: Overwrite existing TypeScript file(s) if they exist. Default: Enable.
-   `-r, --replace`: Replace original JavaScript file(s) with converted TypeScript file(s). Default: Enable.

### Commands

-   `cf <file> [ouptutDirectory] [options]`: Convert a single file.
-   `cdir <directory> [ouptutDirectory] [options]`: Convert all files in a directory.

## Conversion Examples

[Back to top][toc]

```bash
## Convert a single file
npx saph-convert cf ./commands/ping.js
## Convert all files in a directory
npx saph-convert cdir ./commands
```

### Input

```javascript
// src/commands/ping.js
const { ApplicationCommandRegistry, Command } = require('@sapphire/framework');

class UserCommand extends Command {
	/*
	 * @param {Command.LoaderContext} registry
	 */
	constructor(context) {
		super(context, {
			name: 'ping',
			description: 'Ping the bot to check if it is alive.'
		});
	}

	/**
	 * @param {ApplicationCommandRegistry} registry
	 */
	registerApplicationCommands(registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	/**
	 * @param {Command.ChatInputCommandInteraction} interaction
	 */
	async chatInputRun(interaction) {
		return interaction.reply('Pong!');
	}
}

module.exports = { UserCommand };
```

### Output

```typescript
// src/commands/ping.ts
import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({ description: 'Ping the bot to check if it is alive.' })
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description));
	}

	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		return interaction.reply('Pong!');
	}
}
```

## Contributors

Please make sure to read this [Contributing Guide][contributing] before making a pull request.

Thank you to all the people who already contributed to this project!

<a href="https://github.com/fearandesire/saph-convert/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fearandesire/saph-convert" />
</a>

[contributing]: https://github.com/sapphiredev/.github/blob/main/.github/CONTRIBUTING.md
[toc]: #table-of-contents

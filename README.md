<div align="center">

# sapph-convert

**A CLI tool to convert Sapphire Framework command files from JavaScript to TypeScript.**

[![GitHub](https://img.shields.io/github/license/fearandesire/saph-convert?style=flat-square)](https://github.com/fearandesire/cli/blob/main/LICENSE.md)
[![npm](https://img.shields.io/npm/v/saph-convert?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/saph-convert)

</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Description](#description)
- [Features](#features)
- [Usage](#usage)
  - [Global Options](#global-options)
  - [Commands](#commands)
- [Conversion Exemples](#conversion-exemples)
  - [Input](#input)
  - [Output](#output)
- [Contributors](#contributors)

## Description

[Back to top][toc]

This CLI tool is designed to convert Sapphire Framework command files from JavaScript to TypeScript. It is a simple tool that can be used to convert a single command file or all command files within a directory.

> **Note:** This tool is designed to work with Sapphire Framework command files only. It may not work as expected with other types of files.

## Features

[Back to top][toc]

- Convert a single command file
- Convert all command files within a directory
- Replace original JS command file(s) with converted TypeScript files
- Overwrite existing TS file

## Usage

[Back to top][toc]

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

- `-o, --overwrite`: Overwrite existing TypeScript file(s) if they exist. Default: Enable.
- `-r, --replace`:  Replace original JavaScript file(s) with converted TypeScript file(s). Default: Enable.

### Commands

- `cf <file> [ouptutDirectory] [options]`: Convert a single file.
- `cdir <directory> [ouptutDirectory] [options]`: Convert all files in a directory.

## Conversion Exemples

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

module.exports = class UserCommand extends Command {
    /*
     * @param {Command.LoaderContext} registry
     */
    constructor(context) {
       super(context, {
        name: 'ping',
        description: 'Ping the bot to check if it is alive.',
       });
    }
  
    /**
     * @param {ApplicationCommandRegistry} registry
     */
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }
   
    /**
     * @param {Command.ChatInputCommandInteraction} interaction
     */
    async chatInputRun(interaction) {
        return interaction.reply('Pong!');
    }
};
```

### Output

```typescript
// src/commands/ping.ts
import { Command } from '@sapphire/framework';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Command.Options>({ description: 'Ping the bot to check if it is alive.' })
export class UserCommand extends Command {
 
    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        return interaction.reply('Pong!');
    }
}
```

## Contributors

Please make sure to read the [Contributing Guide][contributing] before making a pull request.

Thank you to all the people who already contributed to this project!

<a href="https://github.com/fearandesire/saph-convert/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fearandesire/saph-convert" />
</a>

[contributing]: https://github.com/sapphiredev/.github/blob/main/.github/CONTRIBUTING.md
[toc]: #table-of-contents

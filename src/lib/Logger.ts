import { cyan, magenta, red, yellow } from 'ansis';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';
type Loggable = string | number | boolean | object;

interface LevelColors {
	[key: string]: string;
}

class InternalLogger {
	private levels: LevelColors;
	private cliToolName: string;

	/**
	 * Creates an instance of InternalLogger.
	 * @param {string} cliToolName - The name of the CLI tool.
	 */
	public constructor(cliToolName: string) {
		this.cliToolName = cliToolName;
		this.levels = {
			info: cyan(this.cliToolName),
			debug: magenta(this.cliToolName),
			error: red(this.cliToolName),
			warn: yellow(this.cliToolName)
		};
	}

	/**
	 * Logs an info level message.
	 * @param {...Loggable[]} messages - The messages to log.
	 */
	public info<T extends Loggable>(...messages: T[]): void {
		this.log('info', messages);
	}

	/**
	 * Logs an error level message.
	 * @param {...Loggable[]} messages - The messages to log.
	 */
	public error<T extends Loggable>(...messages: T[]): void {
		this.log('error', messages);
	}

	/**
	 * Logs a warning level message.
	 * @param {...Loggable[]} messages - The messages to log.
	 */
	public warn<T extends Loggable>(...messages: T[]): void {
		this.log('warn', messages);
	}

	/**
	 * Logs a debug level message.
	 * @param {...Loggable[]} messages - The messages to log.
	 */
	public debug<T extends Loggable>(...messages: T[]): void {
		this.log('debug', messages);
	}

	/**
	 * Logs a message with the specified log level.
	 * @param {LogLevel} level - The log level.
	 * @param {Loggable[]} messages - The messages to log.
	 */
	private log<T extends Loggable>(level: LogLevel, messages: T[]): void {
		const lvlPrefix = this.levels[level];
		if (Array.isArray(messages) && messages.length > 1) {
			console.log(`${lvlPrefix}:`);
			messages.forEach((message) => {
				console.log(this.formatMessage(message));
			});
		} else {
			console.log(`${lvlPrefix}: ${this.formatMessage(messages[0])}`);
		}
	}

	/**
	 * Formats a log message.
	 * @param {Loggable} message - The message to format.
	 * @returns {string} The formatted message.
	 */
	private formatMessage<T extends Loggable>(message: T): string {
		if (typeof message === 'object' && message !== null) {
			return JSON.stringify(message, null, 2);
		}
		return String(message);
	}
}

const Logger = new InternalLogger('saph-convert');
export default Logger;

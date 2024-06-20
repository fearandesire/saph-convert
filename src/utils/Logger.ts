import { cyan, magenta, red, yellow } from 'ansis'

type LogLevel = 'info' | 'error' | 'warn' | 'debug'

// Define a type for the allowed message types
type Loggable = string | number | boolean | object

// Define a type for the levels object
interface LevelColors {
	[key: string]: string
}

class InternalLogger {
	private levels: LevelColors

	constructor() {
		// Define log level prefixes and their associated colors
		this.levels = {
			info: cyan('INFO'),
			debug: magenta('DEBUG'),
			error: red('ERROR'),
			warn: yellow('WARN'),
		}
	}

	// Info level log using Loggable
	public info<T extends Loggable>(...messages: T[]): void {
		this.log('info', messages)
	}

	// Error level log using Loggable
	public error<T extends Loggable>(...messages: T[]): void {
		this.log('error', messages)
	}

	// Warning level log using Loggable
	public warn<T extends Loggable>(...messages: T[]): void {
		this.log('warn', messages)
	}

	// Debug level log using Loggable
	public debug<T extends Loggable>(...messages: T[]): void {
		this.log('debug', messages)
	}

	// General logging function using the defined Loggable type
	private log<T extends Loggable>(level: LogLevel, messages: T[]): void {
		// Format timestamp
		const timestamp = `[${new Date().toLocaleTimeString('en-US', { hour12: false })}]`

		// Prepare the prefix with color based on the level
		const lvlPrefix = this.levels[level]

		// Check if messages is an array and has multiple items or complex types
		if (Array.isArray(messages) && messages.length > 1) {
			console.log(`${timestamp} ${lvlPrefix}:`)
			messages.forEach((message) => {
				console.log(this.formatMessage(message))
			})
		} else {
			// Handle single item arrays or non-array messages uniformly
			console.log(
				`${timestamp} ${lvlPrefix}: ${this.formatMessage(messages[0])}`,
			)
		}
	}

	// Helper method to format message based on its type using Loggable
	private formatMessage<T extends Loggable>(message: T): string {
		if (typeof message === 'object' && message !== null) {
			return JSON.stringify(message, null, 2) // Pretty print objects
		}
		return String(message) // Convert all non-object types to string
	}
}

const Logger = new InternalLogger()
export default Logger

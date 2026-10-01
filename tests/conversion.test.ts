import { describe, expect, it } from "vitest";
import { convertToTypeScript } from "../src/functions/convertToTypescript";

describe("convertToTypeScript", () => {
	it("transforms a command with a description and typed interaction", () => {
		const input = [
			"export class LegacyCommand extends Command {",
			"  constructor(context, options) {",
			'    super(context, { ...options, description: "A command" });',
			"  }",
			"  async chatInputRun(interaction) {}",
			"}",
		].join("\n");

		const result = convertToTypeScript(input);

		expect(result).toContain("class UserCommand");
		expect(result).toContain('@ApplyOptions<Command.Options>({ description: "A command" })');
		expect(result).toContain('from "@sapphire/decorators"');
		expect(result).toContain("interaction: Command.ChatInputCommandInteraction");
		expect(result).not.toContain("constructor(");
	});

	it("does not add a decorator without a command description", () => {
		const result = convertToTypeScript("export class LegacyCommand {}");

		expect(result).toContain("class UserCommand");
		expect(result).not.toContain("ApplyOptions");
	});
});

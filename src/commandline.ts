import { Command } from "commander";
import * as path from "path";

function parseInteger(value: string, defaultValue: number): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        return defaultValue;
    }
    return parsed;
}

export function parseArguments() {
    const program = new Command();

    program
        .name("node " + path.basename(__filename))
        .description("Command-line utility for image downloading.")
        .argument("<search_query>", "specify search query")
        .option("--max-download-count <count>", "specify maximum download number", (v) => parseInteger(v, Infinity))
        .option("--recovery-from <number>", "specify recovery starting point", (v) => parseInteger(v, 0))
        .option("--save-url", "save json temp file")
        .parse(process.argv);

    const options = program.opts();

    if (options.maxDownloadCount < 0) {
        console.error("Invalid argument: Max download count must be a non-negative integer.");
        process.exit(1);
    }

    if (options.recoveryFrom < 0) {
        console.error("Invalid argument: Recovery from must be a non-negative integer.");
        process.exit(1);
    }

    const searchQuery = program.args[0];

    return { searchQuery, maxDownloadCount: options.maxDownloadCount, recoveryFrom: options.recoveryFrom, saveUrl: options.saveUrl };
}

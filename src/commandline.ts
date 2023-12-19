import { Command } from "commander";

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
        .name("node " + process.argv[1])
        .description("Command-line utility for image downloading.")
        .argument("<search_query>", "specify search query")
        .option("-m, --max-download-count <count>", "specify maximum download number", (v) => parseInteger(v, Infinity))
        .option("-r, --recovery-from <number>", "specify recovery starting point", (v) => parseInteger(v, 0))
        .option("-s, --save-url", "save json temp file")
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

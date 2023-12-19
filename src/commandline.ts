import { Command } from "commander";

function validateInteger(value: string, name: string) {
    const parsed = parseInt(value, 10);
    // eliminate non-integer,negative number and String
    if (isNaN(parsed) || parsed < 0 || parsed.toString() !== value) {
        throw new Error(`Invalid argument: ${name} must be a non-negative integer.`);
    }
    return parsed;
}

export function parseArguments() {
    const program = new Command();

    program
        .name("node " + process.argv[1])
        .description("Command-line utility for image downloading from e621.")
        .argument("<search_query>", "specify search query with double quote")
        .option(
            "-m, --max-download-count <count>",
            "(Optional) specify maximum download number",
            (v) => validateInteger(v, "Max download count"),
            Infinity
        )
        .option(
            "-r, --recovery-from <number>",
            "(Optional) specify recovery starting point",
            (v) => validateInteger(v, "Recovery from"),
            0
        )
        .option("-s, --save-url", "(Optional) save json temp file", undefined)
        .parse(process.argv);

    const options = program.opts();

    const searchQuery = program.args[0];

    return {
        searchQuery,
        maxDownloadCount: options.maxDownloadCount,
        recoveryFrom: options.recoveryFrom,
        saveUrl: options.saveUrl,
    };
}

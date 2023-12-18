import * as path from 'path';

export function parseCommandLineArguments() {
    return process.argv.includes('--save-url');
}
export function validateArguments() {
    if (process.argv.length < 3) {
        showUsageAndExit();
    }

    const searchQuery = process.argv[2];
    if (!searchQuery) {
        console.error("No search query provided. Usage: node app.js <search_query>");
        process.exit(1);
    }

    let maxDownloadCount = Infinity;
    if (process.argv[3]) {
        const parsedCount = parseInt(process.argv[3], 10);
        if (isNaN(parsedCount) || parsedCount < 0) {
            console.error("Invalid argument: Max download count must be a non-negative integer.");
            process.exit(1);
        }
        maxDownloadCount = parsedCount;
    }

    return { searchQuery, maxDownloadCount };
}

export function showUsageAndExit() {
    const usage = `Usage: node ${path.basename(__filename)} <search_query> [--max-download-count <count>] [--save-url]
    <search_query>                : specify search query
    --max-download-count <count>  : specify maximum download number (optional)
    --save-url                    : save json temp file (optional)`;
    console.log(usage);
    process.exit(1);
}

import * as path from "path";

export function isArgumentsHasSaveUrl() {
    return process.argv.includes("--save-url");
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
    let recoveryFrom = 0; // 新しい変数を初期化

    process.argv.forEach((arg, index) => {
        if (arg === "--max-download-count" && process.argv[index + 1]) {
            const parsedCount = parseInt(process.argv[index + 1], 10);
            if (isNaN(parsedCount) || parsedCount < 0) {
                console.error("Invalid argument: Max download count must be a non-negative integer.");
                process.exit(1);
            }
            maxDownloadCount = parsedCount;
        }

        if (arg === "--recovery-from" && process.argv[index + 1]) {
            const parsedRecovery = parseInt(process.argv[index + 1], 10);
            if (isNaN(parsedRecovery) || parsedRecovery < 0) {
                console.error("Invalid argument: Recovery from must be a non-negative integer.");
                process.exit(1);
            }
            recoveryFrom = parsedRecovery;
        }
    });

    return { searchQuery, maxDownloadCount, recoveryFrom }; // 更新されたリターン値
}

export function showUsageAndExit() {
    const usage = `Usage: node ${path.basename(__filename)} <search_query> [--max-download-count <count>] [--save-url]
    <search_query>                : specify search query
    --max-download-count <count>  : specify maximum download number (optional)
    --save-url                    : save json temp file (optional)`;
    console.log(usage);
    process.exit(1);
}

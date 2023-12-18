"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const playwright_1 = require("playwright");
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;
function initializeBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield playwright_1.chromium.launch({ headless: true });
        const page = yield browser.newPage();
        return [browser, page];
    });
}
function login(page, url) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.goto(url);
        // age dialog
        if (yield page.$("#guest-warning-accept")) {
            yield page.click("#guest-warning-accept");
        }
        yield page.click("#nav-sign-in-link");
        yield page.fill("#name", USER_NAME || '');
        yield page.fill("#password", PASSWORD || '');
        yield page.click('input:text("Submit")');
        yield page.waitForTimeout(1000);
        return page;
    });
}
function makeAllImageUrlList(page, searchQuery, maxDownloadCount) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.fill("#tags", searchQuery);
        yield page.click('button i.fa-solid.fa-magnifying-glass');
        yield page.waitForSelector("#posts > div.paginator");
        const lastPageNumber = yield getLastPageNumber(page);
        console.log(lastPageNumber + "pages exist");
        let allLargeFileUrls = [];
        for (let i = 1; i <= lastPageNumber; i++) {
            yield navigateToPage(page, i);
            const pageUrls = yield extractLargeFileUrlsFromPage(page);
            allLargeFileUrls.push(...pageUrls);
            if (allLargeFileUrls.length >= maxDownloadCount) {
                console.log(`Reached max download count: ${maxDownloadCount}`);
                break;
            }
        }
        return allLargeFileUrls.slice(0, maxDownloadCount);
    });
}
function getLastPageNumber(page) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.numbered-page'));
            return elements.length === 0 ? 1 : parseInt(elements[elements.length - 1].textContent || "1");
        });
    });
}
function navigateToPage(page, pageNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = new URL(page.url());
        url.searchParams.set('page', pageNumber.toString());
        yield page.goto(url.toString());
        console.log(`Navigated to page: ${pageNumber}`);
    });
}
function extractLargeFileUrlsFromPage(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const articleTags = yield page.$$("article");
        const urls = yield Promise.all(articleTags.map((tag) => __awaiter(this, void 0, void 0, function* () {
            const url = yield tag.getAttribute("data-large-file-url");
            return url || undefined; // nullの場合はundefinedに置き換え
        })));
        return urls.filter((url) => url !== undefined); // undefinedを除外
    });
}
function writeImage(page, url, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield page.goto(url, { waitUntil: 'networkidle' });
        if (response) {
            const buffer = yield response.body();
            fs.writeFileSync(`./img/image_${index}.jpg`, buffer);
            console.log(`Downloaded ${url} as image_${index}.jpg`);
        }
        else {
            console.log(`Failed to download ${url}`);
        }
    });
}
function downloadImages(page, largeFileUrls, maxDownloadCount) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync("./img")) {
            fs.mkdirSync("./img");
        }
        for (const [i, url] of largeFileUrls.entries()) {
            if (maxDownloadCount > 0 && i >= maxDownloadCount) {
                console.log(`Reached max download count: ${maxDownloadCount}`);
                break;
            }
            yield writeImage(page, url, i);
            yield new Promise(resolve => setTimeout(resolve, 2500));
        }
    });
}
function saveUrlListToJson(largeFileUrls, filename = 'urlList.json') {
    return __awaiter(this, void 0, void 0, function* () {
        const jsonData = JSON.stringify(largeFileUrls, null, 2);
        fs.writeFileSync(filename, jsonData);
        console.log(`Saved URL list to ${filename}`);
    });
}
function parseCommandLineArguments() {
    return process.argv.includes('--save-url');
}
function showUsageAndExit() {
    const usage = `Usage: node ${path.basename(__filename)} <search_query> [--max-download-count <count>] [--save-url]
    <search_query>                : specify search query
    --max-download-count <count>  : specify maximum download number (optional)
    --save-url                    : save json temp file (optional)`;
    console.log(usage);
    process.exit(1);
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const initUrl = "https://e621.net/session/new";
        const tempFilename = 'urlList.json';
        const searchQuery = process.argv[2];
        const saveUrl = parseCommandLineArguments();
        if (process.argv.length < 3) {
            showUsageAndExit();
        }
        if (!searchQuery) {
            console.error("No search query provided. Usage: node app.js <search_query>");
            process.exit(1);
        }
        let maxDownloadCount = Infinity;
        if (process.argv[3]) {
            const parsedCount = parseInt(process.argv[3], 10);
            if (isNaN(parsedCount) || parsedCount < 0) {
                console.error("Invalid argument: Max download count must be a non-negative integer.");
                return;
            }
            maxDownloadCount = parsedCount;
        }
        try {
            const [browser, page] = yield initializeBrowser();
            yield login(page, initUrl);
            const largeFileUrls = yield makeAllImageUrlList(page, searchQuery, maxDownloadCount);
            // save url as json
            yield saveUrlListToJson(largeFileUrls, tempFilename);
            yield downloadImages(page, largeFileUrls, maxDownloadCount);
            // --save-url が指定されていない場合のみ、一時ファイルを削除
            if (!saveUrl) {
                fs.unlinkSync(tempFilename);
                console.log(`Deleted temporary file: ${tempFilename}`);
            }
            yield page.close();
            yield browser.close();
            return;
        }
        catch (error) {
            console.error("An error occurred:", error);
        }
    });
}
main();
//# sourceMappingURL=scrape_e621.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var fs = require("fs");
var path = require("path");
var playwright_1 = require("playwright");
var USER_NAME = process.env.USER_NAME;
var PASSWORD = process.env.PASSWORD;
function initializeBrowser() {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, playwright_1.chromium.launch({ headless: true })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [2 /*return*/, [browser, page]];
            }
        });
    });
}
function login(page, url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.goto(url)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.$("#guest-warning-accept")];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 4];
                    return [4 /*yield*/, page.click("#guest-warning-accept")];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, page.click("#nav-sign-in-link")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.fill("#name", USER_NAME || '')];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, page.fill("#password", PASSWORD || '')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.click('input:text("Submit")')];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, page.waitForTimeout(1000)];
                case 9:
                    _a.sent();
                    return [2 /*return*/, page];
            }
        });
    });
}
function makeAllImageUrlList(page, searchQuery, maxDownloadCount) {
    return __awaiter(this, void 0, void 0, function () {
        var lastPageNumber, allLargeFileUrls, i, pageUrls;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.fill("#tags", searchQuery)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.click('button i.fa-solid.fa-magnifying-glass')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("#posts > div.paginator")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, getLastPageNumber(page)];
                case 4:
                    lastPageNumber = _a.sent();
                    console.log(lastPageNumber + "pages exist");
                    allLargeFileUrls = [];
                    i = 1;
                    _a.label = 5;
                case 5:
                    if (!(i <= lastPageNumber)) return [3 /*break*/, 9];
                    return [4 /*yield*/, navigateToPage(page, i)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, extractLargeFileUrlsFromPage(page)];
                case 7:
                    pageUrls = _a.sent();
                    allLargeFileUrls.push.apply(allLargeFileUrls, pageUrls);
                    if (allLargeFileUrls.length >= maxDownloadCount) {
                        console.log("Reached max download count: ".concat(maxDownloadCount));
                        return [3 /*break*/, 9];
                    }
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 5];
                case 9: return [2 /*return*/, allLargeFileUrls.slice(0, maxDownloadCount)];
            }
        });
    });
}
function getLastPageNumber(page) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.evaluate(function () {
                        var elements = Array.from(document.querySelectorAll('.numbered-page'));
                        return elements.length === 0 ? 1 : parseInt(elements[elements.length - 1].textContent || "1");
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function navigateToPage(page, pageNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = new URL(page.url());
                    url.searchParams.set('page', pageNumber.toString());
                    return [4 /*yield*/, page.goto(url.toString())];
                case 1:
                    _a.sent();
                    console.log("Navigated to page: ".concat(pageNumber));
                    return [2 /*return*/];
            }
        });
    });
}
function extractLargeFileUrlsFromPage(page) {
    return __awaiter(this, void 0, void 0, function () {
        var articleTags, urls;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.$$("article")];
                case 1:
                    articleTags = _a.sent();
                    return [4 /*yield*/, Promise.all(articleTags.map(function (tag) { return __awaiter(_this, void 0, void 0, function () {
                            var url;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, tag.getAttribute("data-large-file-url")];
                                    case 1:
                                        url = _a.sent();
                                        return [2 /*return*/, url || undefined]; // nullの場合はundefinedに置き換え
                                }
                            });
                        }); }))];
                case 2:
                    urls = _a.sent();
                    return [2 /*return*/, urls.filter(function (url) { return url !== undefined; })]; // undefinedを除外
            }
        });
    });
}
function writeImage(page, url, index) {
    return __awaiter(this, void 0, void 0, function () {
        var response, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle' })];
                case 1:
                    response = _a.sent();
                    if (!response) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.body()];
                case 2:
                    buffer = _a.sent();
                    fs.writeFileSync("./img/image_".concat(index, ".jpg"), buffer);
                    console.log("Downloaded ".concat(url, " as image_").concat(index, ".jpg"));
                    return [3 /*break*/, 4];
                case 3:
                    console.log("Failed to download ".concat(url));
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function downloadImages(page, largeFileUrls, maxDownloadCount) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, i, url;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!fs.existsSync("./img")) {
                        fs.mkdirSync("./img");
                    }
                    _i = 0, _a = largeFileUrls.entries();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    _b = _a[_i], i = _b[0], url = _b[1];
                    if (maxDownloadCount > 0 && i >= maxDownloadCount) {
                        console.log("Reached max download count: ".concat(maxDownloadCount));
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, writeImage(page, url, i)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2500); })];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function saveUrlListToJson(largeFileUrls, filename) {
    if (filename === void 0) { filename = 'urlList.json'; }
    return __awaiter(this, void 0, void 0, function () {
        var jsonData;
        return __generator(this, function (_a) {
            jsonData = JSON.stringify(largeFileUrls, null, 2);
            fs.writeFileSync(filename, jsonData);
            console.log("Saved URL list to ".concat(filename));
            return [2 /*return*/];
        });
    });
}
function parseCommandLineArguments() {
    return process.argv.includes('--save-url');
}
function showUsageAndExit() {
    var usage = "Usage: node ".concat(path.basename(__filename), " <search_query> [--max-download-count <count>] [--save-url]\n    <search_query>                : specify search query\n    --max-download-count <count>  : specify maximum download number (optional)\n    --save-url                    : save json temp file (optional)");
    console.log(usage);
    process.exit(1);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var initUrl, tempFilename, searchQuery, saveUrl, maxDownloadCount, parsedCount, _a, browser, page, largeFileUrls, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    initUrl = "https://e621.net/session/new";
                    tempFilename = 'urlList.json';
                    searchQuery = process.argv[2];
                    saveUrl = parseCommandLineArguments();
                    if (process.argv.length < 3) {
                        showUsageAndExit();
                    }
                    if (!searchQuery) {
                        console.error("No search query provided. Usage: node app.js <search_query>");
                        process.exit(1);
                    }
                    maxDownloadCount = Infinity;
                    if (process.argv[3]) {
                        parsedCount = parseInt(process.argv[3], 10);
                        if (isNaN(parsedCount) || parsedCount < 0) {
                            console.error("Invalid argument: Max download count must be a non-negative integer.");
                            return [2 /*return*/];
                        }
                        maxDownloadCount = parsedCount;
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, initializeBrowser()];
                case 2:
                    _a = _b.sent(), browser = _a[0], page = _a[1];
                    return [4 /*yield*/, login(page, initUrl)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, makeAllImageUrlList(page, searchQuery, maxDownloadCount)];
                case 4:
                    largeFileUrls = _b.sent();
                    // save url as json
                    return [4 /*yield*/, saveUrlListToJson(largeFileUrls, tempFilename)];
                case 5:
                    // save url as json
                    _b.sent();
                    return [4 /*yield*/, downloadImages(page, largeFileUrls, maxDownloadCount)];
                case 6:
                    _b.sent();
                    // --save-url が指定されていない場合のみ、一時ファイルを削除
                    if (!saveUrl) {
                        fs.unlinkSync(tempFilename);
                        console.log("Deleted temporary file: ".concat(tempFilename));
                    }
                    return [4 /*yield*/, page.close()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, browser.close()];
                case 8:
                    _b.sent();
                    return [2 /*return*/];
                case 9:
                    error_1 = _b.sent();
                    console.error("An error occurred:", error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main();

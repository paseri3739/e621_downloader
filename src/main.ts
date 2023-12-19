import "dotenv/config";
import * as fs from "fs";
import { isArgumentsHasSaveUrl, validateArguments } from "./commandline";
import { makeAllImageUrlList, saveUrlListToJson } from "./domParsers";
import { initializeBrowser, login } from "./initializeBrowser";
import { downloadImages } from "./io";

export const USER_NAME = process.env.USER_NAME;
export const PASSWORD = process.env.PASSWORD;

async function main() {
    const initUrl = "https://e621.net/session/new";
    const tempFilename = "urlList.json";
    const { searchQuery, maxDownloadCount, recoveryFrom } = validateArguments();
    const saveUrl = isArgumentsHasSaveUrl();

    try {
        const [browser, page] = await initializeBrowser();
        await login(page, initUrl);
        const largeFileUrls = await makeAllImageUrlList(page, searchQuery, maxDownloadCount);

        // save url as json
        await saveUrlListToJson(largeFileUrls, tempFilename);

        await downloadImages(page, largeFileUrls, maxDownloadCount, recoveryFrom);

        // --save-url が指定されていない場合のみ、一時ファイルを削除
        if (!saveUrl) {
            fs.unlinkSync(tempFilename);
            console.log(`Deleted temporary file: ${tempFilename}`);
        }

        await page.close();
        await browser.close();
        return;
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();

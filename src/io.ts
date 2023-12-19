import * as fs from "fs";
import { Page } from "playwright";

async function writeImage(page: Page, url: string, index: number) {
    const response = await page.goto(url, { waitUntil: "networkidle" });

    if (response) {
        const buffer = await response.body();
        fs.writeFileSync(`./img/image_${index}.jpg`, buffer);
        console.log(`Downloaded ${url} as image_${index}.jpg`);
    } else {
        console.log(`Failed to download ${url}`);
    }
}
export async function downloadImages(page: Page, largeFileUrls: string[], maxDownloadCount: number, recoveryFrom: number = 0) {
    if (!fs.existsSync("./img")) {
        fs.mkdirSync("./img");
    }

    for (const [i, url] of largeFileUrls.entries()) {
        if (i < recoveryFrom) {
            continue; // recoveryFromより前のインデックスはスキップ
        }

        if (maxDownloadCount > 0 && i >= maxDownloadCount) {
            console.log(`Reached max download count: ${maxDownloadCount}`);
            break;
        }

        await writeImage(page, url, i);

        await new Promise((resolve) => setTimeout(resolve, 2500));
    }
}

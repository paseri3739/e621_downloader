from playwright.sync_api import sync_playwright
import os
import time
import requests


def scrape_url_with_playwright(url):
    # Playwright の初期化
    p = sync_playwright().start()

    # ブラウザの起動
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    page.goto(url)
    # JavaScriptを実行してページをフルスクロール（必要に応じて）
    page.evaluate("window.scrollTo(0, document.body.scrollHeight);")

    page.wait_for_timeout(1000)
    if page.locator("#guest-warning-accept"):
        page.click("#guest-warning-accept")

    page.wait_for_timeout(2000)

    article_tags = page.query_selector_all("article")

    large_file_urls = [tag.get_attribute("data-large-file-url") for tag in article_tags]

    # ブラウザを閉じない
    # browser.close()

    # Playwright セッションを終了する（ブラウザは開いたまま）
    p.stop()

    return large_file_urls


def download_images(large_file_urls):
    if not os.path.exists("./img"):
        os.mkdir("./img")

    for i, url in enumerate(large_file_urls):
        response = requests.get(url)
        response.raise_for_status()

        with open(f"./img/image_{i}.jpg", "wb") as f:
            f.write(response.content)

        print(f"Downloaded {url} as image_{i}.jpg")

        time.sleep(2)


def main():
    # スクレイピング対象のURL
    url = "https://e621.net/posts?tags=kuromu"

    try:
        large_file_urls = scrape_url_with_playwright(url)
        print("Found data-large-file-url(s):", large_file_urls)
        print(f"There are {len(large_file_urls)} URL(s) in the page.")

        download_images(large_file_urls)
    except Exception as e:
        print("An error occurred:", e)


main()
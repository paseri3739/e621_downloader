import requests
from bs4 import BeautifulSoup


def scrape_url(url):
    # カスタムユーザーエージェントを設定
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/117.0"}

    # 指定したURLからHTMLを取得（ユーザーエージェントを設定）
    response = requests.get(url, headers=headers)

    # ステータスコードが200 (OK) でなければ例外を発生させる
    response.raise_for_status()

    # BeautifulSoupオブジェクトを作成
    soup = BeautifulSoup(response.text, "html.parser")

    # 'article' タグを探す
    article_tags = soup.find_all("article")

    # 'data-large-file-url' 属性を取得
    large_file_urls = [tag.get("data-large-file-url") for tag in article_tags]

    return large_file_urls


# スクレイピング対象のURL
url = "https://e621.net/posts?tags=kuromu"

# スクレイピングを実行
try:
    large_file_urls = scrape_url(url)
    print("Found data-large-file-url(s):", large_file_urls)
except Exception as e:
    print("An error occurred:", e)

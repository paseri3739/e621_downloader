# scrape_e621

このスクリプトはe621にログインして検索クエリを入力し、ページ遷移しながら指定したダウンロード数に達するまでURLをリストアップし、リストアップしたURLを利用して2秒ごとにダウンロードを行う。Playwrightを利用してブラウザ操作を模倣、ログインする手順を踏むことによってe621の未ログインユーザーに対する閲覧制限を回避することができる。

# 依存関係

node.js(npm)<br>
Homebrew, apt, snapなどでインストールしてください。Windowsの方は公式のインストーラーなどで。

# インストール方法

TypeScriptを利用して開発していますが、tscでコンパイルしてmain.jsをnodeで実行できます。

```
$ npm install
$ tsc
```

依存関係が解決できたら.envという名前の隠しファイルを作り、以下のように編集します。

```
USER_NAME="your_user_name"
PASSWORD="your_password"
```

# 実行

以下のようにコマンドを入力して実行してください。
```
node dist/main.js "検索クエリ"
```
```
node dist/main.js -h
```
でコマンドライン引数が一覧できます。


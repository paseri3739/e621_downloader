# scrape_e621

このスクリプトはe621にログインして検索クエリを入力し、ページ遷移しながら指定したダウンロード数に達するまでURLをリストアップし、リストアップしたURLを利用して2秒ごとにダウンロードを行う。Playwrightを利用してブラウザ操作を模倣、ログインする手順を踏むことによってe621の未ログインユーザーに対する閲覧制限を回避することができる。

# インストール方法

TypeScriptを利用して開発していますが、まだJavaScriptにコンパイルする方法がよくわかっていないのでJSファイルはありません。ts-nodeで実行してください。依存関係は下のコマンドで解決できると思います。npmとかのインストール方法については調べればいくらでも出てくるので割愛します。最後のコマンドは必要ない場合もあるのでとりあえず実行してみて、エラー表示が出たら表示に書かれているコマンドを実行してplaywrightをインストールしてください。

```
$ npm install
$ npm install typescript --save-dev #if required
$ npx install playwright #if required
```

依存関係が解決できたら.envという名前の隠しファイルを作り、以下のように編集します。

```
USER_NAME="your_user_name"
PASSWORD="your_password"
```

# 実行

以下のようにコマンドを入力して実行してください。
```
ts-node scrape_e621.ts "your_search_query" number_of_download_limit
```
第２引数はクォーテーションマークで囲って検索クエリを入力してください。第３引数には整数を指定します。


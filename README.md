# Fly.io の Express サンプル

Fly.io で Express を動かすサンプル

## 必要な環境

### クラウドサービス

クラウドサービスのアカウントを作成する

- [GitHub](https://github.co.jp/)
- [Fly.io](https://fly.io/)

### macOS 、 Linux の場合

以下のツールをインストールする

- [Git](https://git-scm.com/)
- [asdf](https://asdf-vm.com/)
- [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)
- [Docker](https://docs.docker.com/get-docker/)

### Windows の場合

WSL 上で開発する場合、 macOS 、 Linux と同じ環境を構築する

- [WSL2](https://docs.microsoft.com/ja-jp/windows/wsl/install)

WSL を使わずに Windows 上で開発する場合、以下のツールをインストールする

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/ja/) 20.5.0 以上
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Docker Desktop](https://docs.docker.com/docker-for-windows/install/)
- [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)

## CI/CD

main ブランチにプッシュすると、 Fly.io にデプロイされる

詳細は [.github/workflows/fly-deploy.yml](.github/workflows/fly-deploy.yml) を参照

## セットアップ

### リポジトリのフォーク

GitHub でこのリポジトリをフォークする

### リポジトリのクローン

    $ git clone <フォークしたリポジトリー>

    $ cd <リポジトリー名>

### asdf を使う場合

asdf のプラグインをインストールする

    $ awk '{system("asdf plugin-add " $1)}' .tool-versions

asdf で Node.js をインストールする

    $ asdf install

### Node.js パッケージのインストール

    $ yarn

### ローカルでの実行

コンテナで PostgreSQL を起動

    $ docker compose up --build --detach map_db

環境変数を設定

    $ export DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres

マイグレーションを実行

    $ yarn prisma migrate deplo
ローカルでビルド

    $ yarn build

ローカルで起動

    $ yarn start

ブラウザで `http://localhost:5173` にアクセス

ローカルでの PostgreSQL 停止(データは削除されない)

    $ docker compose down

### コンテナでの実行

コンテナでビルド、起動

    $ docker compose up --build

ブラウザで `http://localhost:3000` にアクセス

コンテナの停止

    $ docker compose down

### Fly.io へのデプロイ

Fly.io にログイン

    $ fly auth login

Fly.io にアプリケーションを作成

    $ fly launch

Fly.io にデプロイ

    $ fly deploy

Fly.io にデプロイしたアプリケーションを開く

    $ fly apps open

## データベースへの接続

### ローカルでの接続

    $ psql -h localhost -U postgres -d postgres

ローカルデータベースを削除する場合

    $ docker compose down --volumes

### Fly.io での接続

    $ fly postgres connect -a <PostgreSQL のアプリケーション名> -d <Express のアプリケーション名>

## ゼロから作る手順

### リポジトリの作成

GitHub でリポジトリを作成

### 初期プロジェクトの作成

    $ npx --yes @flydotio/node-demo@latest

    $ npx node-demo --ems --express --postgresql --tailwindcss --prisma

### スキーマの変更

prisma ディレクトリの schema.prisma を本リポジトリの内容に変更する

### マイグレーションの作成

    $ npx prisma migrate dev --name init

初期データ登録など、必要なマイグレーションを作成する

### Dockerfile の作成

    $ npx --yes @flydotio/dockerfile@latest

docker-compose.yml を本リポジトリの内容で作成する

### デプロイ

Fly.io にログイン

    $ fly auth login

Fly.io にアプリケーションを作成

    $ fly launch

データベースに PostgreSQL を設定する

メモリを 256 MB に設定する

Fly.io のデプロイトークンを作成し、 GitHub リポジトリの Secrets に登録する

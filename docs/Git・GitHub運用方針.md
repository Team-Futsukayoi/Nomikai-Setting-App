# Git・GitHub運用方針

## 概要

本プロジェクトにおける Git と GitHub の運用方針について記載します。

## 前提

- Git の環境構築が完了している
- GitHub のアカウントを持っている

## 運用方針

GitHub Flow のような運用を行います。
GitHub Flow については、[公式ドキュメント](https://docs.github.com/ja/get-started/using-github/github-flow)があるので、詳しく知りたい方はご参照ください。

### ブランチについて

`main` ブランチと `feature` ブランチを使用します。

#### main ブランチ

その名の通り、メインとなるブランチです。
作業用に作成した `feature` ブランチから Pull Request を作成し、レビューを受けた後に `main` ブランチへマージします。
※マージは PR 作成者（レビューを受けた人）が行うこととします。
そのため、直接 `main` ブランチにコミットすることはありません。

#### feature ブランチ

作業用のブランチです。
作業開始時に、 `main` ブランチから作成し（ブランチを切り）、作業が完了したら `main` ブランチへの Pull Request を作成します。
ブランチ作成時は、 `main` ブランチを最新の状態にしてから（ git pull してから ）作成します。

また、1つの `feature` ブランチは1つの Issue に対応するようにします。
命名は `feature/#{Issue番号}_作業内容の概要` とします。

例:

- feature/#23_chat
- feature/#7_setting_firebase

#### 実際の流れ

```sh
# 1. 対応する Issue を選ぶ（確認する）

# 2. main ブランチを最新の状態にする
# git checkout main でも可
git switch main
git pull

# 3. feature ブランチを作成する
# ブランチ名を `` で囲わないと 環境次第で「#」が使えない可能性があります
# git checkout -b 'feature/#XX_hoge' でも可
git switch -c 'feature/#XX_hoge'

# 4. 作業を行い、コミットする

# 5. push する
git push origin 'feature/#XX_hoge'

# 6. GitHub で Pull Request を作成する

# 7. レビューを受け、修正が必要だったら修正してコミット、 push する

# 8. レビューが完了したらマージする
```

なお、上記はコマンドを実行する場合の例です。
VS Code 上のソース管理や、その他 GUI ツールを使用しても問題ありません。

### コミットメッセージについて

[.commitlint.config.cjs](../commitlint.config.cjs) の types を参考にコミットメッセージの接頭辞（ Prefix ）を付けてください。

例: `feat: チャット機能を実装`

### Visual Studio Code Commitizen Support の利用

[Visual Studio Code Commitizen Support](https://marketplace.visualstudio.com/items?itemName=KnisterPeter.vscode-commitizen) という VS Code の拡張機能をインストールするとコミットメッセージの入力を補助してくれます。

特にこだわり等がなければ、上記拡張機能をインストールしてコミットを行ってください。

なお、上記拡張機能を使うと、 Prefix やメインとなるコミットメッセージの他に、スコープや本文などを入力することもできますが、これらは入力しなくても大丈夫です。

Prefix と メインとなるコミットメッセージ（ `変更内容を要約した本質的説明:` ）の入力のみで大丈夫です。

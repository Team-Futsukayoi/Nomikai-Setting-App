const express = require('express');
const path = require('path');
const app = express();
const port = 4000;

// Reactのビルドされた静的ファイルを提供
app.use(express.static(path.join(__dirname, 'dist')));

// すべてのルートでReactのindex.htmlを返す
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const express = require('express');
const app = express();
const port = 4000;

// ルートエンドポイントのハンドラー
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// サーバーを起動
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
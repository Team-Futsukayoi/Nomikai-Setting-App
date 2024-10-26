// import { friendList } from './test-data';

// export const fetchFriendList = async () => {
//     // 通常はここでAPI呼び出しを行うが、今回はテストデータから取得
//     console.log("test")
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(friendList);
//         }, 500); // 500ms後にデータを取得したとする
//     });
// };

// mock_api.js
import { friendList } from './test-data'; // 名前付きエクスポートとしてインポート

export const fetchFriendList = async () => {
  // 通常はここでAPI呼び出しを行うが、今回はテストデータから取得
  console.log('test');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(friendList);
    }, 500); // 500ms後にデータを取得したとする
  });
};

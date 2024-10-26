import SignUp from './SignUp.jsx'; // SignUpコンポーネントをインポート
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ChatListPage from './ChatListPage.jsx'
//仮設ルーター用インポート、公式ルーター開設後は削除
import { BrowserRouter, Link, Routes, Route, } from 'react-router-dom';

function App() {
    //const [count, setCount] = useState(0);

    return (
        <>
            <div className="App">
                <h1>Nomikai Setting App</h1> */
        /* <SignUp /> サインアップフォームを表示 */

                {/*This is temporal Router
        {/* <BrowserRouter>
          <div className="App">
            <li>
              <Link to="/SignUp">SignUp</Link>
            </li>
            <Link to="/ChatListPage">Chat List Page</Link>
            <Routes>
              <Route exact path="/SignUp" element={<SignUp />} />
              <Route path="/ChatListPage" element={<ChatListPage />} />
            </Routes>
          </div>
        </BrowserRouter> */}
            </div>

            {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> 
      <h1>Vite + React</h1>
      */}
            {/* <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div> */}
            {/* <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
        </>
    );
}

export default App;

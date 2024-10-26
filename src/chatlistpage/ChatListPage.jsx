//import { Button, Box } from 'react';
import { useNavigate } from 'react-router-dom';
//フレンドグループを選択したときの状態を保持するためのState
import { useState } from 'react';
import FriendPage from './FriendList';
import GroupPage from './GroupList';
// import FriendPage from './FriendList';
// import GroupPage from './GroupList';

//現時点ではユーザーの情報のみを付与
//
//testdata_userinfoの型定義
/**
 * param {testdata_userinfo} ユーザー情報
 * userinfo.id: ユーザーID
 *  上のIDに関しては、FirebaseのFireStoreのIDを想定していました
 * userinfo.username: ユーザー名
 * userinfo.icon: ユーザーアイコン
 * @returns ChatListPage
 */
const ChatListPage = (userinfo) => {
    //閲覧する項目の選択状態を保持するState
    //isFriendClisked:フックによって管理される変数
    //setIsFriendClicked:変数を更新する"関数"
    const [isFriendClicked, setIsFriendClicked] = useState(false);
    const [isGroupClicked, setIsGroupClicked] = useState(false);
    //ナビゲーション関数の読込
    const navigate = useNavigate();

    //ボタン
    //参考サイト-> https://react.school/ui/button
    // const Button = styled.Button`
    //     background-color: ${(props) => theme[porps.theme].default};
    //     color: white;
    //     padding: 5px 10px;


    // `;
    return (
        <>
            <div>
                <li>名前 {userinfo.username}</li>
                <li>
                    アイコン
                    <img id="usericon" src={userinfo.icon} sizes='200px' />
                </li>
                {/* <icon src={testdata_userinfo.icon} /> */}
            </div>
            {/*</BrowserRouter>* onClick={<Link to="/FriendList" />}*/}
            {/*onclickは関数を渡す必要有り*/}
            <div>
                <button
                    style={{ display: 'inline-block' }}
                    //上手いことルート読まない
                    onClick={() => {
                        setIsFriendClicked(true);
                        setIsGroupClicked(false);
                        console.log("FriendPage")
                    }}
                >
                    フレンド
                </button>
                <button
                    style={{ display: 'inline-block' }}
                    //onClick={() => navigate('../GroupList')}
                    onClick={() => {
                        //2行以上にまたぐJSは{}で囲む
                        setIsGroupClicked(true);
                        setIsFriendClicked(false);
                        console.log("GroupPage")
                    }}
                >
                    グループ
                </button>
                {isFriendClicked && <FriendPage />}
                {isGroupClicked && <GroupPage />}

            </div>



        </>

    )
}

export default ChatListPage;
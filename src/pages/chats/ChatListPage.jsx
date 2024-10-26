import {
    Box,
    Button,
    Container,
    TextField
} from '@mui/material';

//import { Button, Box } from 'react';
//フレンドグループを選択したときの状態を保持するためのState
import { useState, useEffect } from 'react';
import FriendList from './FriendList';
import GroupList from './GroupList';
import { fetchFriendList } from './mock_api';
import { db } from '../../firebaseConfig';// Firestoreの設定
import { collection, addDoc } from 'firebase/firestore';// Firestoreでデータを保存するメソッド
//import friendList from './test-data';
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
 * 
 */


function getUserInfo() {
    const testdata_userinfo = { id: 1, username: "xyamyko", icon: "https://img.benesse-cms.jp/pet-dog/item/image/normal/resized/resized_5920ec8f-c0ae-4caa-8a37-25e538152b12.jpg" }
    return testdata_userinfo;
}


export const ChatListPage = () => {
    //閲覧する項目の選択状態を保持するState
    //isFriendClisked:フックによって管理される変数
    //setIsFriendClicked:変数を更新する"関数"
    const [isFriendClicked, setIsFriendClicked] = useState(false);
    const [isGroupClicked, setIsGroupClicked] = useState(false);
    const [isFriendList, setIsFriendList] = useState([]);
    const [friendName, setFriendName] = useState('');

    const userinfo = getUserInfo();
    //useEffectでAPIからフェッチ(BackEndからデータを取得)する
    //レンダーの度にAPIを叩くのは非効率なので、useEffectを使って一度だけ取得する(現時点での設計)
    useEffect(() => {
        const getFriends = async () => {
            const friendList = await fetchFriendList();
            if (Array.isArray(friendList)) {
                setIsFriendList(friendList);
            } else {
                setIsFriendList([friendList])
            }
            //setIsFriendList(friendList);
        }
        getFriends();
    },
        //ここの[]は依存する変数がない場合にのみ実行される
        //依存する関数とは、関数内で使用している変数のこと
        //即ち、この場合は、関数内で使用している変数がない場合にのみ実行される
        []);

    //ナビゲーション関数の読込
    //const navigate = useNavigate();

    //ボタン
    //参考サイト-> https://react.school/ui/button
    // const Button = styled.Button`
    //     background-color: ${(props) => theme[porps.theme].default};
    //     color: white;
    //     padding: 5px 10px;
    
    const handleAddFriend = async () => {
        if (friendName.trim()) {
            try {
                const docRef = await addDoc(collection(db, 'friends'), {
                    name: friendName,
                    addedBy: userinfo.username,
                });
                console.log('フレンドを追加しました。ID:', docRef.id);
                setFriendName('');//テキストフィールドを空にする
            } catch (error) {
                console.error('エラーが発生しました:', error);
            }
        }
    };
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
                <div>
                    <button
                        style={{ display: 'inline-block' }}
                        //上手いことルート読まない
                        onClick={() => {
                            setIsFriendClicked(true);
                            setIsGroupClicked(false);
                            //console.log(isFriendList);
                            console.log("FriendPage");
                        }}
                    >
                        フレンド
                    </button>
                </div>
                <div>
                    <button
                        style={{ display: 'inline-block' }}
                        //onClick={() => navigate('../GroupList')}
                        onClick={() => {
                            //2行以上にまたぐJSは{}で囲む
                            setIsGroupClicked(true);
                            setIsFriendClicked(false);
                            console.log("GroupPage");
                        }}
                    >
                        グループ

                    </button>
                </div>
                {/* フレンド追加フォーム */}
                <div>
                    <TextField
                        label="フレンド名"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddFriend}
                        style={{ marginLeft: '10px' }}
                    >
                        フレンドを追加
                    </Button>
                </div>
                
                <div>
                    {isFriendClicked && <FriendList friendList={isFriendList} />}
                    {isGroupClicked && <GroupList friendList={isFriendList} />}
                </div>
            </div>
        </>
    );
};

export default ChatListPage;
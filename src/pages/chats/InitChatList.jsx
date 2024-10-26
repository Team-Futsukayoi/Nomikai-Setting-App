import { ChatListPage } from './ChatListPage.jsx';

const testdata_userinfo = { id: 1, username: "xyamyko", icon: "https://www.tbs.co.jp/anime/machikado/1st/special/img/special17/icon01.png" }


export const InitChatList = () => {
    return (
        <ChatListPage {...getUserInfo()} />
    );
}

function getUserInfo() {
    return testdata_userinfo;
}
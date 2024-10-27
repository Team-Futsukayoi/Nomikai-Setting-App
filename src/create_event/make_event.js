import { createEvent } from './create_event';

//この処理については30％位の割合で発生させたい
//イベント情報をチャットに送信する
export function makeEventForApis() {
    const isCreate = new Boolean((Math.random) < 1 ? true : false);

    if (isCreate) {
        //const getIvent = createEvent();
        const getIvent = "test";
        return getIvent;
    }
    console.log("イベント情報はありません")
}
function test() {
    const event = makeEventForApis();
    console.log(event);
}
test();

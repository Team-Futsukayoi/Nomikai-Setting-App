function createEvent() {
    const eventname = setEventName();
    const storeInfo = setStoreInfo();
    const date = setDate();
    const event = {
        eventname: eventname,
        storeInfo: storeInfo,
        date: date,
    }
    return event;
}

async function setDate() {
    const d = new Date();
    const randomint = Math.floor(3 * (Math.random() * 10));
    d.setDate(d.getDate() + randomint);
    console.log(d);
    return d

}

function setEventName() {
    const eventname = "Event Name";
    return eventname;
}

function setStoreInfo() {
    const storeInfo = {
        name: '個室焼肉 琥珀',
        station_name: '盛岡',
        access: '盛岡大通/盛岡駅から徒歩10分',
        open: '月～木: 11:00～14:30 （料理L.O. 14:00 ドリンクL.O. 14:00）17:30～23:00 （料理L.O. 22:30 ドリンクL.O. 22:30）金、土: 17:30～23:00 （料理L.O. 22:30 ドリンクL.O. 22:30）',
    }
    return storeInfo;
}
function test() {
    const event = createEvent();
    console.log(event);
}

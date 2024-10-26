import { Button, Box } from 'react';




const GroupList = ({ friendList }) => {
    return (
        <>
            <div>
                this is FriendPage
                <button onClick={
                    () => {
                        console.log(friendList);
                        console
                    }
                }>
                    Check-toLoad
                </button>
                <ul>
                    {friendList.map(({ id, name, iconUrl, isGroop }) => {
                        console.log(isGroop)
                        if (isGroop) {
                            return (
                                <li key={id}>
                                    {name}
                                    <img src={iconUrl} />
                                    {isGroop}
                                    <button onClick={console.log("ChatListへの遷移")}>グループに参加</button>
                                </li>
                            )
                        }
                    })}


                </ul>
            </div>
        </>
    )
}

export default GroupList;
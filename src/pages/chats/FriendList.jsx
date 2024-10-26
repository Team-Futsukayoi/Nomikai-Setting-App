import { Button, Box } from 'react';

/**
 * 
 * @param {*} friendslist
 * @param {*} friendslist.id
 * @param {*} friendslist.friendname
 * @param {*} friendslist.iconUrl
 * @param {*} friendslist.isGroop
 * 
 * @returns 
 */

//{}で囲ったら動いた->分割代入
export const FriendPage = ({ friendList }) => {
    //const friendList = friendslist
    //const friendsArray = Array.isArray(friendsList) ? friendsList : [friendsList];
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
                        if (!isGroop) {
                            return (
                                <li key={id}>
                                    {name}
                                    <img src={iconUrl} />
                                    {isGroop}
                                </li>
                            )
                        }
                    })}


                </ul>
            </div>
        </>
    )
}



export default FriendPage;
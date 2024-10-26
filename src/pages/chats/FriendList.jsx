import { Button, Box } from 'react';

/**
 * 
 * @param {*} friendslist
 * @param {*} friendslist.id
 * @param {*} friendslist.name
 * @param {*} friendslist.iconUrl
 * @param {*} friendslist.isGroop
 * 
 * @returns 
 */


const FriendPage = (friendList) => {
    //const friendList = friendslist
    //const friendsArray = Array.isArray(friendsList) ? friendsList : [friendsList];
    const friendsArray = Array.isArray(friendList) ? friendList : [];
    return (
        <>
            <div>
                this is FriendPage
                <button onClick={
                    () => {
                        console.log(friendsArray);
                        console
                    }
                }>
                    Check-toLoad
                </button>
                <ul>
                    {friendList.map(({ id, name, iconUrl, isGroop }) =>
                        <li key={id}>
                            {name}
                            <img src={iconUrl} />
                            {isGroop}
                        </li>
                    )}
                </ul>
            </div>
        </>
    )
}



export default FriendPage;
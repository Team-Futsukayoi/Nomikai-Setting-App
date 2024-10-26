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

const FriendPage = (friendslist) => {
  const friendList = friendslist;
  return (
    <>
      <div>
        this is FriendPage
        <button
          onClick={() => {
            console.log(friendList.id);
          }}
        >
          Check-toLoad
        </button>
        <ul>
          {friendList.map((id, name, iconUrl, isGroop) => (
            <li key={id}>
              {name}
              <img src={iconUrl} />
              {isGroop}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default FriendPage;

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { faCheck, faXmark, faPaperPlane, faUserPlus } from "@fortawesome/free-solid-svg-icons";

const Account = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [friendSearch, setFriendSearch] = useState('');
  const [findedUsers, setFindedUsers] = useState([]);

  const getFriends = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        {
          withCredentials: true,
          params: {
            userId: "662fd064af3b75b643342b8a",
          },
        }
      );

      setFriends(response.data.friends);
      setRequests(response.data.requests);

      console.log("friends", response.data);
    } catch (error) {
      console.log("errorFriends");
    }
  };

  const friendRequestAnswer = async (reqId, status) => {
    try {
      const response = await axios.put(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        { reqestId: reqId, status: status },
        { withCredentials: true }
      );
      if (response.status === 200) {
        getFriends();
      }
      console.log("answerfrReq", response.data);
    } catch (error) {
      console.log("answerfrReq", error);
    }
  };

  const searchUsers = async () => {
    if(friendSearch.length > 0){
        try {
            const response = await axios.post(process.env.REACT_APP_BACK_URL + "/searchuser",{searchquery: friendSearch}, {withCredentials:true})
            if(response.status === 200){
                setFindedUsers(response.data)
            }
        } catch (error) {
            console.log("errorSearchUsers", error);
        }
    }
    
  }

  const sendFriendRequest = async (idToSend) => {
    try {
        
        const response = await axios.post(process.env.REACT_APP_BACK_URL + "/friendrequest",
        { userId: '662fd064af3b75b643342b8a', userIdToSend: idToSend },
        { withCredentials: true })
        if(response.status === 200){
            console.log('sent')
            getFriends()
        }
    } catch (error) {
        console.log("sendFriendRequest", error);
    }
  }

  useEffect(()=>{
    searchUsers()
  },[friendSearch])

  useEffect(() => {
    getFriends();
  }, []);

  return (
    <div className="bg-green-600 h-screen">
      <h1 className="text-4xl font-bold">Акаунт</h1>
      <div className="blockEl bg-green-700 ">
        <div className="grid grid-cols-3 gap-5 items-stretch">
          <div className="blockEl bg-slate-800">
            <span className="font-xl font-bold mb-3 block">Друзі</span>
            {friends.map((friend, index) => (
              <div
                key={index}
                className="p-1 inline-flex gap-2 bg-green-800 rounded-full pl-2 mr-2 mb-2"
              >
                <span>{friend?.userInfo?.displayName}</span>
                <img
                  className="w-6 h-6 rounded-full"
                  src={friend?.userInfo?.image}
                  alt="userlogo"
                />
                <button
                  className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                  onClick={() => friendRequestAnswer(friend?.reqId, "rejected")}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>
          <div className="blockEl bg-slate-800">
            <span className="font-xl font-bold mb-3 block">Запити друзів</span>
            {requests.map((request, index) => (
              <div
                key={index}
                className="p-1 inline-flex gap-2 bg-green-800 rounded-full pl-2 mr-2 mb-2"
              >
                <span>{request?.userInfo?.displayName}</span>
                <img
                  className="w-6 h-6 rounded-full"
                  src={request?.userInfo?.image}
                  alt="userlogo"
                />
                <button
                  className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                  onClick={() =>
                    friendRequestAnswer(request?.reqId, "accepted")
                  }
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                  onClick={() =>
                    friendRequestAnswer(request?.reqId, "rejected")
                  }
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ))}
          </div>
          <div className="blockEl bg-slate-800">
            <span className="font-xl font-bold mb-3 block">Пошук друзів</span>
            <input value={friendSearch} onChange={(e)=>setFriendSearch(e.target.value)}  type="text" className="w-full rounded-xl indent-2 outline-none h-6 bg-slate-500" placeholder="Введіть ім`я" />
            <div className="bg-green-300">
                {findedUsers.map((user, index)=>(
                    <div
                    key={index}
                    className="p-1 inline-flex gap-2 bg-green-800 rounded-full pl-2 mr-2 mb-2"
                  >
                    <span>{user?.displayName}</span>
                    <img
                      className="w-6 h-6 rounded-full"
                      src={user?.image}
                      alt="userlogo"
                    />
                    <button
                      className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                      onClick={() =>
                        sendFriendRequest(user?._id)
                      }
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faUserPlus} />
                    </button>
                    
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <div className="blockEl bg-green-700">Ваші витрати</div>
      <div className="blockEl bg-green-700">Валюта</div>
      <div className="blockEl bg-green-700">
        Номер картки для повернення коштів
      </div>

      <div className="blockEl bg-green-700">Зміна мови</div>
    </div>
  );
};

export default Account;

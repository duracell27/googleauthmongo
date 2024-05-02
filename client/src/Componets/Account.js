import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  faCheck,
  faXmark,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../App";
import toast from "react-hot-toast";

const Account = () => {
  const { userdata } = useContext(AuthContext);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [friendSearch, setFriendSearch] = useState("");
  const [findedUsers, setFindedUsers] = useState([]);

  //функція для отримання списку друзів та запитів друзів. отримує 2 масива з бд
  const getFriends = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        {
          withCredentials: true,
          params: {
            userId: userdata._id,
          },
        }
      );
      if (response.status === 200) {
        setFriends(response.data.friends);
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.log("errorFriends");
    }
  };

  //функція для підтвердження або скачування запиту в друзі
  const friendRequestAnswer = async (reqId, status) => {
    try {
      const response = await axios.put(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        { reqestId: reqId, status: status },
        { withCredentials: true }
      );
      if (response.status === 200) {
        getFriends();
        toast.success(response?.data?.message);
      }
      //   console.log("answerfrReq", response.data);
    } catch (error) {
        toast.error(error?.response?.data);
    //   console.log("answerfrReq", error);
    }
  };

  //функція для пошуку користувачів, поветає масив юзерів 10шт по пошуковому запиті
  const searchUsers = async () => {
    if (friendSearch.length === 0) {
      setFindedUsers([]);
      return;
    }
    if (friendSearch.length > 0) {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BACK_URL + "/searchuser",
          { searchquery: friendSearch },
          { withCredentials: true }
        );
        if (response.status === 200) {
          setFindedUsers(response.data);
        }
      } catch (error) {
        toast.error(error?.response?.data);
        // console.log("errorSearchUsers", error);
      }
    }
  };

  // функція створює запит дружби для позначеного користувача
  const sendFriendRequest = async (idToSend) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        { userId: userdata._id, userIdToSend: idToSend },
        { withCredentials: true }
      );
      if (response.status === 200) {
        getFriends();
        toast.success(response?.data?.message)
      }
      if(response.status === 404){
        toast.error(response?.data?.message)
      }
    } catch (error) {
    //   console.log("sendFriendRequest", error);
      toast.error(error?.response?.data);
    }
  };

  //оновлюємо масив знайдених користувачів при вводі в поле пошуку користувача
  useEffect(() => {
    searchUsers();
  }, [friendSearch]);

  //загружаємо початкову інформацію про друзів та запити друзів
  useEffect(() => {
    getFriends();
  }, []);

  return (
    <div className="bg-green-600 h-screen">
      <h1 className="text-4xl font-bold">Акаунт</h1>
      <div className="blockEl bg-green-700 ">
        {/* секція друзі початок */}
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
                  referrerpolicy="no-referrer"
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
                  referrerpolicy="no-referrer"
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
            <input
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              type="text"
              className="w-full rounded-xl indent-2 outline-none h-6 bg-slate-500"
              placeholder="Введіть ім`я"
            />
            {findedUsers.length > 0 && (
              <div className="bg-green-600 blockEl">
                {findedUsers.map((user, index) => (
                  <div
                    key={index}
                    className="p-1 inline-flex gap-2 bg-green-800 rounded-full pl-2 mr-2 mb-2"
                  >
                    <span>{user?.displayName}</span>
                    <img
                      className="w-6 h-6 rounded-full"
                      src={user?.image}
                      alt="userlogo"
                      referrerpolicy="no-referrer"
                    />
                    <button
                      className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                      onClick={() => sendFriendRequest(user?._id)}
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faUserPlus} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* секція друзі кінець */}
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

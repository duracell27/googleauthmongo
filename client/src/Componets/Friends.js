import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../App";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowRight,
  faCoins,
  faMoneyBillWave,
  faUserGroup,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Friends = () => {
  const { userdata } = useContext(AuthContext);
  const [settles, setSettles] = useState([]);
  const [friends, setFriends] = useState([]);

  const [friendPopupOpenId, setFriendPopupOpenId] = useState([]);

  // отримати всі ттранзакціх по розрахунках звязаних з ід користувача
  const getSettles = () => {
    axios
      .get(process.env.REACT_APP_BACK_URL + "/settle", {
        params: {
          userId: userdata._id,
        },
      })
      .then((response) => {
        let sortedSettles = response.data.sort((a, b) => {
          // Сортування за lender.displayName
          let nameA = a.lender.displayName.toLowerCase();
          let nameB = b.lender.displayName.toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;

          // Якщо lender.displayName однакові, сортуємо за amount
          return a.amount - b.amount;
        });
        setSettles(sortedSettles);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };
  // отримати список друзів
  const getFriends = () => {
    axios
      .get(process.env.REACT_APP_BACK_URL + "/friendrequest", {
        params: {
          userId: userdata._id,
        },
      })
      .then((response) => {
        if(response.status === 200) {
          setFriends(response.data.friends);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };
  // для людей які не друзі а є розрахунки, то можна додати в друзі
  const addFriendHandler = async (userToSendId) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACK_URL + "/friendrequest",
        {
          userId: userdata._id,
          userIdToSend: userToSendId,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const friendPopupHandler = (id) => {
    if(friendPopupOpenId.includes(id)){
      setFriendPopupOpenId(friendPopupOpenId.filter((item) => item!== id));
    }else{
      setFriendPopupOpenId([...friendPopupOpenId, id]);
    }
  }

  useEffect(() => {
    getSettles();
    getFriends();
  }, []);

  let rezultArray = [];
  // якщо всі дані є, то почати формувати масив з транзакціями, сортування та розрахунки
  if (settles?.length > 0 && friends?.length > 0) {
    //якщо у людини нема друзів то брати людей з розрахунків
    const myId = userdata._id;

    // перевірка на те чи ти друг чи ні
    function isFriend(userId) {
      return friends.some((friend) => friend.userInfo._id === userId);
    }

    // прохід по масиву і перевірка чи друг, якщо так до дадаєш до друзів і тавиш позначку що не друг
    settles.forEach((settle) => {
      const { ower, lender } = settle;

      if (ower._id !== myId && !isFriend(ower._id)) {
        friends.push({ userInfo: ower, notFriend: true });
      }

      if (lender._id !== myId && !isFriend(lender._id)) {
        friends.push({ userInfo: lender, notFriend: true });
      }
    });

    friends.forEach((friend) => {
      let obj = {};
      obj.friendName = friend.userInfo.displayName;
      obj.friendId = friend.userInfo._id;
      obj.notFriend = friend.notFriend;

      let settlesArr = settles.filter(
        (settle) =>
          settle.ower._id === friend.userInfo._id ||
          settle.lender._id === friend.userInfo._id
      );

      const settlesArrResult = settlesArr.filter((settle) => settle.amount > 0);
      const settlesArrSetled = settlesArr.filter(
        (settle) => settle.settled > 0
      );

      if (settlesArrSetled.length > 0) {
        settlesArrResult.forEach((unfiltered) => {
          settlesArrSetled.forEach((payed) => {
            if (
              unfiltered.ower._id === payed.ower._id &&
              unfiltered.lender._id === payed.lender._id &&
              unfiltered.groupId._id === payed.groupId._id
            ) {
              unfiltered.amount -= payed.settled;
            }
          });
        });
      }

      settlesArrResult.sort((a, b) => {
        // Сортування за lender.displayName
        let nameA = a.lender.displayName.toLowerCase();
        let nameB = b.lender.displayName.toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;

        // Якщо lender.displayName однакові, сортуємо за amount
        return a.amount - b.amount;
      });

      const filteredSettlesArrResult = settlesArrResult.filter(
        (item) => item.amount !== 0
      );

      obj.settles = filteredSettlesArrResult;

      let totalSettlesSum = 0;
      settlesArrResult.forEach((settle) => {
        if (settle.ower._id === friend.userInfo._id) {
          totalSettlesSum += +settle.amount;
        } else if (settle.lender._id === friend.userInfo._id) {
          totalSettlesSum -= +settle.amount;
        }
      });

      if (!totalSettlesSum == 0) {
        obj.totalSettlesSum = totalSettlesSum;
        rezultArray.push(obj);
      }
    });
  }
  console.log(rezultArray);
  console.log(friendPopupOpenId);
  return (
    <div className="bg-green-600 min-h-screen">
      <h1 className="text-2xl font-bold mb-3 block">Друзі</h1>
      <div className=" flex flex-col gap-3">
        {/* відображення масиву з транзакціями по друзях */}
        {rezultArray.length === 0 && (
          <div className="flex flex-col items-center gap-3">
            <span className="text-xl font-bold mb-3 block">
              У вас ще немає взаєморозрахунків з друзями
            </span>
          </div>
        )}
        {rezultArray.length > 0 &&
          rezultArray.map((friend, index) => (
            <div key={index} onClick={()=>friendPopupHandler(friend.friendId)}>
              <div className="hidden md:bg-green-800 md:p-2 md:rounded-lg md:block">
                <div className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:my-1 items-center gap-3">
                  <span className="text-xl font-bold pr-5">
                    {friend.friendName}
                  </span>
                  <div className="flex gap-2 bg-slate-800 items-center rounded-full px-2">
                    <FontAwesomeIcon className="" icon={faCoins} />
                    <span
                      className={`${
                        friend.totalSettlesSum.toFixed(2) > 0
                          ? "text-green-500"
                          : friend.totalSettlesSum.toFixed(2) < 0
                          ? "text-red-500"
                          : "text-white"
                      } font-bold text-xl`}
                    >
                      {friend.totalSettlesSum.toFixed(2)}{" "}
                      {userdata.curency.curencySymbol}
                    </span>
                  </div>
                  {friend.notFriend ? (
                    <span
                      onClick={() => addFriendHandler(friend.friendId)}
                      className="w-6 h-6 bg-slate-800 flex items-center justify-center rounded-full cursor-pointer"
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faUserPlus} />
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <div className={` flex-col items-center md:mt-3  md:items-start gap-2 ${friendPopupOpenId.includes(friend.friendId)?'flex':'hidden'}`}>
                  {friend.settles?.length > 0 &&
                    friend.settles.map((transaction, index) => (
                      <div
                        key={index + "desktopSettles"}
                        className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:mb-0 items-center gap-2 rounded-lg py-1 "
                      >
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          <span className="text-red-500">
                            {transaction.ower.displayName}
                          </span>
                          <img
                            className="w-6 h-6 rounded-full"
                            src={transaction.ower.image}
                            alt=""
                          />
                        </span>
                        <FontAwesomeIcon icon={faCircleArrowRight} />
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          <span className="text-green-500">
                            {transaction.lender.displayName}
                          </span>
                          <img
                            className="w-6 h-6 rounded-full"
                            src={transaction.lender.image}
                            alt=""
                          />
                        </span>
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          {transaction.amount} {userdata.curency.curencySymbol}
                        </span>
                        <FontAwesomeIcon icon={faCircleArrowRight} />
                        <div className="flex items-center gap-2 bg-slate-800 p-1 pl-2 rounded-full">
                          <span>
                            <FontAwesomeIcon icon={faUserGroup} />
                          </span>
                          <span>
                            <Link
                              className="flex items-center gap-2"
                              to={`profile/group/${transaction.groupId._id}`}
                            >
                              {transaction.groupId.name}{" "}
                              {transaction.groupId.image.length > 0 ? (
                                <img
                                  className="w-6 h-6 rounded-full"
                                  src={transaction.groupId.image}
                                  alt="groupAva"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  className="bg-green-800 w-4 h-3 p-1 rounded-full"
                                  icon={faUserGroup}
                                />
                              )}{" "}
                            </Link>
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
                    {/* для мобілки */}
              <div className="md:hidden text-sm bg-green-800 p-2 rounded-lg">
                <div className="flex p-2 items-center rounded-lg justify-between">
                  <span className="text-xl pr-5">{friend.friendName}</span>
                  <div className="flex gap-2 bg-slate-800 items-center rounded-full px-2">
                    <FontAwesomeIcon className="" icon={faCoins} />
                    <span
                      className={`${
                        friend.totalSettlesSum.toFixed(2) > 0
                          ? "text-green-500"
                          : friend.totalSettlesSum.toFixed(2) < 0
                          ? "text-red-500"
                          : "text-white"
                      } text-xl`}
                    >
                      {friend.totalSettlesSum.toFixed(2)}{" "}
                      {userdata.curency.curencySymbol}
                    </span>
                  </div>
                </div>
                <div className={` flex-col items-center gap-2 ${friendPopupOpenId.includes(friend.friendId)?'flex':'hidden'}`}>
                  {friend.settles?.length > 0 &&
                    friend.settles.map((transaction, index) => (
                      <div
                        key={index + "mobileSettles"}
                        className="flex bg-green-900 justify-stretch w-full p-2 flex-col items-center gap-2 rounded-lg py-1 "
                      >
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          <span className="text-red-500">
                            {transaction.ower.displayName}
                          </span>
                          <img
                            className="w-6 h-6 rounded-full"
                            src={transaction.ower.image}
                            alt=""
                          />
                        </span>
                        {/* <FontAwesomeIcon icon={faCircleArrowRight} /> */}
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          <span className="text-green-500">
                            {transaction.lender.displayName}
                          </span>
                          <img
                            className="w-6 h-6 rounded-full"
                            src={transaction.lender.image}
                            alt=""
                          />
                        </span>
                        {/* <FontAwesomeIcon icon={faMoneyBillWave} /> */}
                        <span className="flex gap-2 rounded-full pl-2 p-1 bg-slate-800">
                          {transaction.amount} {userdata.curency.curencySymbol}
                        </span>
                        {/* <FontAwesomeIcon icon={faCircleArrowRight} /> */}
                        <div className="flex items-center gap-2 bg-slate-800 p-1 pl-2 rounded-full">
                          <span>
                            <FontAwesomeIcon icon={faUserGroup} />
                          </span>
                          <span>
                            <Link
                              className="flex items-center gap-2"
                              to={`profile/group/${transaction.groupId._id}`}
                            >
                              {transaction.groupId.name}{" "}
                              {transaction.groupId.image.length > 0 ? (
                                <img
                                  className="w-6 h-6 rounded-full"
                                  src={transaction.groupId.image}
                                  alt="groupAva"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  className="bg-green-800 w-4 h-3 p-1 rounded-full"
                                  icon={faUserGroup}
                                />
                              )}{" "}
                            </Link>
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Friends;

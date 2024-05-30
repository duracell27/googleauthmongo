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
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Friends = () => {
  const { userdata } = useContext(AuthContext);
  const [settles, setSettles] = useState([]);
  const [friends, setFriends] = useState([]);

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
        setFriends(response.data.friends);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  useEffect(() => {
    getSettles();
    getFriends();
  }, []);

  let rezultArray = [];
  // якщо всі дані є, то почати формувати масив з транзакціями, сортування та розрахунки
  if (settles?.length > 0 && friends?.length > 0) {
    friends.forEach((friend) => {
      let obj = {};
      obj.friendName = friend.userInfo.displayName;

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

  return (
    <div className="bg-green-600 min-h-screen">
      <h1 className="font-xl font-bold mb-3 block">Друзі</h1>
      <div className=" flex flex-col gap-3">
        {/* відображення масиву з транзакціями по друзях */}
        {rezultArray.length > 0 &&
          rezultArray.map((friend, index) => (
            <div key={index} className="bg-green-800 p-2 rounded-lg">
              <div className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:mb-2 items-center gap-3">
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
                    {userdata.curency.curencyValue}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center  md:items-start gap-2">
                {friend.settles?.length > 0 &&
                  friend.settles.map((transaction, index) => (
                    <div
                      key={index}
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
                        {transaction.amount} {userdata.curency.curencyValue}
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
          ))}
      </div>
    </div>
  );
};

export default Friends;

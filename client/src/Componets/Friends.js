import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../App";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleArrowRight,
  faMoneyBillWave,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Friends = () => {
  const { userdata } = useContext(AuthContext);
  const [settles, setSettles] = useState([]);
  const [friends, setFriends] = useState([]);

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

  if (settles?.length > 0 && friends?.length > 0) {
    friends.forEach((friend) => {
      let obj = {};
      obj.friendName = friend.userInfo.displayName;
      let settlesArr = settles.filter(
        (settle) =>
          settle.ower._id === friend.userInfo._id ||
          settle.lender._id === friend.userInfo._id
      );
      obj.settles = settlesArr;
      let totalSettlesSum = 0;
      settlesArr.forEach((settle) => {
        if (settle.ower._id === friend.userInfo._id) {
          totalSettlesSum += settle.amount;
        } else if (settle.lender._id === friend.userInfo._id) {
          totalSettlesSum -= settle.amount;
        }
      });
      if (!totalSettlesSum == 0) {
        console.log("ноль");
        obj.totalSettlesSum = totalSettlesSum;
        rezultArray.push(obj);
      }
    });
  }

  console.log("settles", settles);
  console.log("friends", friends);
  console.log("rezultArray", rezultArray);

  return (
    <div>
      <h1>Друзі</h1>
      <div className="">
        {rezultArray.length > 0 &&
          rezultArray.map((friend, index) => (
            <div key={index} className="">
              <div className="flex gap-3">
              <span>{friend.friendName}</span>
              <span className={`${friend.totalSettlesSum.toFixed(2)>0?'text-green-500':friend.totalSettlesSum.toFixed(2)<0?'text-red-500':'text-white'} font-bold`}>{friend.totalSettlesSum.toFixed(2)}</span>
              </div>
              
              {friend.settles?.length > 0 &&
                friend.settles.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-800 rounded-lg py-1 px-2"
                  >
                    <span className="flex gap-2">
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
                    <span className="flex gap-2">
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
                    <span className="text-xl font-bold">
                      {transaction.amount}
                    </span>
                    <span><FontAwesomeIcon icon={faUserGroup}/></span>
                    <span><Link to={`profile/group/${transaction.groupId._id}`}>{transaction.groupId.name} {transaction.groupId.image.length>0?(<img className="w-6 h-6 rounded-full" src={transaction.groupId.image} alt="groupAva" />):(<FontAwesomeIcon className="bg-green-800 w-4 h-3 p-1 rounded-full" icon={faUserGroup}/>)}  </Link></span>
                  </div>
                ))}
            </div>
          ))}
      </div>

      <hr />
      {/* <div className="flex flex-col items-start gap-2">
        {settles?.length > 0 &&
          settles.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-slate-800 rounded-lg py-1 px-2"
            >
              <span className="flex gap-2">
                <span className="text-red-500">
                  {transaction.ower.displayName}
                </span>
                <img
                  referrer-policy="no-referrer"
                  className="w-6 h-6 rounded-full"
                  src={transaction.ower.image}
                  alt=""
                />
              </span>
              <FontAwesomeIcon icon={faCircleArrowRight} />
              <span className="flex gap-2">
                <span className="text-green-500">
                  {transaction.lender.displayName}
                </span>
                <img
                  referrer-policy="no-referrer"
                  className="w-6 h-6 rounded-full"
                  src={transaction.lender.image}
                  alt=""
                />
              </span>

              <span className="text-xl font-bold">{transaction.amount}</span>
            </div>
          ))}
      </div> */}
    </div>
  );
};

export default Friends;

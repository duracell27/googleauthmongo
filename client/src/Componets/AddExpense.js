import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import toast from "react-hot-toast";
import axios from "axios";
import moment from "moment";
import "moment/locale/uk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faUsers } from "@fortawesome/free-solid-svg-icons";

const AddExpense = () => {
  const { userdata } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState();
  const [selectedFriend, setSelectedFriend] = useState();

  const getGroups = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/groupAll",
        {
          withCredentials: true,
          params: {
            userId: userdata._id,
          },
        }
      );
      if (response.status === 200) {
        response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setGroups(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const getFriends = async () => {
    axios
      .get(process.env.REACT_APP_BACK_URL + "/friendrequest", {
        params: {
          userId: userdata._id,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setFriends(response.data.friends);
        }
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message);
      });
  };

  const selectedGroupHandler = (group) => {
    setSelectedFriend({})
    setSelectedGroup(group);
  };

  const selectedFriendHandler = (friend) => {
    setSelectedGroup({})
    setSelectedFriend(friend);
  };

  useEffect(() => {
    getFriends();
    getGroups();
  }, []);

  console.log("groups", groups);
  console.log("selectedgroup", selectedGroup);
  console.log("selectedfriend", selectedFriend);
  console.log("friends", friends);

  return (
    <div>
      <span>Куди додати витрату?</span>
      <div className="flex gap-2 flex-wrap md:flex-nowrap">
        <div className=" blockEl w-full md:w-1/2 bg-green-700">
          <span>Групи</span>
          {groups.length > 0 &&
            groups.map((group, index) => (
              <div
                onClick={() => selectedGroupHandler(group)}
                key={index}
                className={` ${
                  selectedGroup?._id === group?._id
                    ? " border-orange-500 border-2 "
                    : ""
                } flex justify-between bg-slate-800 rounded-full items-center my-2`}
              >
                <div className="flex gap-2 items-center rounded-full pl-2 p-1 bg-slate-800">
                  <span>
                    {moment(group.createdAt).locale("uk").format("DD MMM YYYY")}
                  </span>
                  {group.image.length > 0 ? (
                    <img
                      src={group.image}
                      alt="groupAvatar"
                      className="w-8 h-8 rounded-full "
                    />
                  ) : (
                    <FontAwesomeIcon
                      className="w-6 h-6 p-6 bg-slate-600 rounded-full"
                      icon={faUsers}
                    />
                  )}
                  <span>{group.name}</span>
                </div>
                {selectedGroup?._id === group?._id && (
                  <div className="">
                    <FontAwesomeIcon
                      className="text-orange-500 w-8 h-8 pr-1 pt-1"
                      icon={faCircleCheck}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
        <div className=" blockEl w-full md:w-1/2 bg-green-700">
          <span>Друзі</span>
          {friends.length > 0 &&
            friends.map((friend, index) => (
              <div
                onClick={() => selectedFriendHandler(friend)}
                key={index}
                className={` ${
                  selectedFriend?.userInfo?._id === friend?.userInfo?._id
                    ? " border-orange-500 border-2 "
                    : ""
                } flex justify-between bg-slate-800 rounded-full items-center my-2`}
              >
                <div className="flex gap-2 p-1 pl-2 items-center">
                  <span>{friend?.userInfo?.displayName}</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src={friend?.userInfo?.image}
                    alt="userlogo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {selectedFriend?.userInfo?._id === friend?.userInfo?._id && (
                  <div className="">
                    <FontAwesomeIcon
                      className="text-orange-500 w-8 h-8 pr-1 pt-1"
                      icon={faCircleCheck}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;

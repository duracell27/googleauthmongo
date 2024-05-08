import {
  faPlus,
  faUserPlus,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { AuthContext } from "../App";
import ExpenseForm from "./ExpenseForm";

const GroupPage = () => {
  const { id } = useParams();
  const { userdata } = useContext(AuthContext);

  const [friends, setFriends] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");
  const [findedUsers, setFindedUsers] = useState([]);

  const [addMembersPopup, setAddMembersPopup] = useState(false);
  const [addExpensePopup, setAddExpensePopup] = useState(false);

  //   отримуємо список друзів щоб можна було легко додати до групи
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
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //   завантажуємо основну інформацію про групу
  const getGroupInfo = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/group",
        {
          withCredentials: true,
          params: {
            groupId: id,
          },
        }
      );
      if (response.status === 200) {
        setGroupInfo(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //   видалямо користувача з групи
  const deleteMember = async (memberId) => {
    try {
      const response = await axios.delete(
        process.env.REACT_APP_BACK_URL + "/group/members",
        {
          withCredentials: true,
          params: {
            groupId: id,
            delUserId: memberId,
          },
        }
      );
      if (response.status === 200) {
        toast.success(response?.data?.message);
        getGroupInfo();
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //   додаємо учасника до групи
  const sendMemberRequest = async (memberId) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACK_URL + "/group/members",
        { groupId: id, userId: memberId },
        { withCredentials: true }
      );

      if (response.status === 200) {
        if (response?.data?.warning) {
          toast.error(response?.data?.message);
        } else {
          toast.success(response?.data?.message);
          getGroupInfo();
          setMemberSearch("");
          setFindedUsers([]);
        }
      }
    } catch (error) {
      //   console.log("sendFriendRequest", error);
      toast.error(error?.response?.data);
    }
  };
  //   пошук користувачів за іменем
  const searchUsers = async () => {
    if (memberSearch.length === 0) {
      setFindedUsers([]);
      return;
    }
    if (memberSearch.length > 0) {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BACK_URL + "/searchuser",
          { searchquery: memberSearch },
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
  //   видаляємо групу
  const deleteGroupHandler = async () => {
    try {
      const response = await axios.delete(
        process.env.REACT_APP_BACK_URL + "/group",
        {
          withCredentials: true,
          params: {
            groupId: id,
          },
        }
      );

      if (response.status === 200) {
        toast.success(response?.data?.message);
        window.location.href = "/profile/groups";
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  // при зміні поля пошуку, шукаємо користувачів
  useEffect(() => {
    searchUsers();
  }, [memberSearch]);

  //   завантажуємо інформацію про групу і друзів при початковій загрузці сторінки
  useEffect(() => {
    getGroupInfo();
    getFriends();
  }, []);

  return (
    <div className="bg-green-600 h-screen">
      {/* cсекція з назвою лого і датою */}
      <div className="text-4xl font-bold mb-3 flex items-center gap-5">
        {groupInfo?.image.length > 0 ? (
          <img
            src={groupInfo?.image}
            alt="groupAvatar"
            className="w-20 h-20 rounded-full border-4 border-white"
          />
        ) : (
          <FontAwesomeIcon
            className="w-6 h-6 p-6 bg-slate-600 rounded-full"
            icon={faUsers}
          />
        )}
        <span className="grow">
          {groupInfo?.name}
          <p className="text-xl text-white/60">
            {moment(groupInfo?.createdAt).locale("uk").format("DD MMM YYYY")}
          </p>
        </span>
        {groupInfo?.members[0]?._id === userdata?._id ? (
          <div
            onClick={deleteGroupHandler}
            className="blockEl bg-green-800 text-xl cursor-pointer"
          >
            Видалити групу
          </div>
        ) : (
          ""
        )}
      </div>

      {/* основна секція з витратами та учасниками */}
      <div className="flex gap-5">
        {/* секція з витратами */}
        <div className="blockEl bg-green-700 grow">
          <span className="font-xl font-bold mb-3 block">Витрати</span>
          <button
            className="bg-slate-800 rounded-full p-2 px-4"
            onClick={() => setAddExpensePopup((prev) => !prev)}
          >
            <FontAwesomeIcon icon={addExpensePopup ? faXmark : faPlus} /> <span>Додати витрату</span>
          </button>
          {addExpensePopup && (
            <ExpenseForm groupId={id} members={groupInfo.members}/>
          )}
        </div>
        {/* секція з витратами кінець*/}


        {/* секція з учасниками групи */}
        <div className="blockEl bg-green-700 flex flex-col">
          <span className="font-xl font-bold mb-3 block">Учасники</span>
          {groupInfo?.members.map((member, index) => (
            <div
              key={index}
              className="p-1 inline-flex gap-2 bg-green-800 rounded-full pl-2 mr-2 mb-2"
            >
              <span>{member?.displayName}</span>
              <img
                className="w-6 h-6 rounded-full"
                src={member?.image}
                alt="userlogo"
                referrerPolicy="no-referrer"
              />
              <button
                className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                onClick={() => deleteMember(member?._id)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ))}

          <button
            className="bg-slate-800 rounded-full"
            onClick={() => setAddMembersPopup((prev) => !prev)}
          >
            <FontAwesomeIcon icon={addMembersPopup ? faXmark : faPlus} />
          </button>
          {addMembersPopup && (
            <>
              <div className="blockEl bg-green-800">
                <span className="font-xl font-bold mb-3 block">
                  Пошук по імені
                </span>
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  type="text"
                  className="w-full rounded-xl indent-2 p-1 outline-none bg-slate-500"
                  placeholder="Введіть ім`я"
                />
                {findedUsers.length > 0 && (
                  <div className="bg-green-600 blockEl flex flex-col">
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
                          referrerPolicy="no-referrer"
                        />
                        <button
                          className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                          onClick={() => sendMemberRequest(user?._id)}
                        >
                          <FontAwesomeIcon
                            className="w-4 h-4"
                            icon={faUserPlus}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="blockEl bg-green-800 flex flex-col">
                <span className="font-xl font-bold mb-3 block">
                  або з друзів
                </span>
                {friends.map((friend, index) => (
                  <div
                    key={index}
                    className="p-1 inline-flex gap-2 bg-green-700 rounded-full pl-2 mr-2 mb-2"
                  >
                    <span>{friend?.userInfo?.displayName}</span>
                    <img
                      className="w-6 h-6 rounded-full"
                      src={friend?.userInfo?.image}
                      alt="userlogo"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      className="bg-slate-800 rounded-full w-6 h-6 cursor-pointer"
                      onClick={() => sendMemberRequest(friend?.userInfo?._id)}
                    >
                      <FontAwesomeIcon className="w-4 h-4" icon={faUserPlus} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* секція з учасниками групи кінець */}
      </div>
    </div>
  );
};

export default GroupPage;

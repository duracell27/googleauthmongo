import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment";
import "moment/locale/uk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faPlus,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const Groups = () => {
  const { userdata } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [addGroupPopup, setAddGroupPopup] = useState(false);

  const [groupUploadAvatar, setGroupUploadAvatar] = useState(null);
  const [groupNameInput, setGroupNameInput] = useState("");

  //отримати всі групи які належать користувачу
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
        setGroups(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //отримання посилання на аватар від авс
  const groupAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    const data = new FormData();
    data.append("file", file);

    if (file) {
      try {
        const response = await axios.post(
          process.env.REACT_APP_BACK_URL + "/aws/getIngameUrl",
          data,
          {
            withCredentials: true,
            headers: {
              "Contetnt-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          setGroupUploadAvatar(response.data);
          console.log(response);
        }
      } catch (error) {
        toast.error(error?.response?.data);
      }
    }
  };
  // створення групи
  const createGroupHandler = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACK_URL + "/group",
        {
          userId: userdata._id,
          groupName: groupNameInput,
          groupImage: groupUploadAvatar,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        setGroupNameInput("");
        setGroupUploadAvatar(null);
        setAddGroupPopup(false);
        getGroups();
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  // розраховує загальний баланс користувача в групі чи він винен чи ні
  const calculateNetTotalUser = (expenses) => {
    let netTotalUser = 0;
    expenses.forEach((expense) => {
      expense.land.forEach((land) => {
        if (land.user === userdata._id) {
          netTotalUser += land.sum;
        }
      });
      expense.owe.forEach((owe) => {
        if (owe.user === userdata._id) {
          netTotalUser -= owe.sum;
        }
      });
    });

    return netTotalUser;
  };

  useEffect(() => {
    getGroups();
  }, []);

  // console.log(groups);

  return (
    <div className="bg-green-600 h-screen">
      <h1 className="text-4xl font-bold mb-3">Групи</h1>
      {/* створити групу секція */}
      <div className="blockEl bg-green-700 ">
        <div className="blockEl bg-slate-800 text-center">
          <span
            onClick={() => setAddGroupPopup((prev) => !prev)}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={addGroupPopup ? faXmark : faPlus} /> Створити
            групу
          </span>
          {/* попап від створення групи */}
          {addGroupPopup && (
            <div className="blockEl  bg-green-700 flex justify-center items-center gap-5">
              <label>
                <div
                  className={`rounded-full ${
                    groupUploadAvatar ? " w-16 h-16 " : " p-6 "
                  }  aspect-square bg-green-600`}
                >
                  {groupUploadAvatar ? (
                    <img
                      src={groupUploadAvatar}
                      alt="userlogo"
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <FontAwesomeIcon className="w-6 h-4" icon={faImage} />
                  )}
                </div>
                <input
                  type="file"
                  onChange={groupAvatarChange}
                  className="hidden"
                />
              </label>
              <label>
                <input
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  type="text"
                  className="w-full rounded-xl indent-2 p-1 outline-none bg-green-600 text-white placeholder:text-white"
                  placeholder="Назва групи"
                />
              </label>
              <button
                onClick={createGroupHandler}
                className="p-1 px-2 rounded-xl bg-slate-800 font-bold"
              >
                Створити
              </button>
            </div>
          )}
        </div>
        {/* вивести список всіх груп */}
        {groups.length > 0 &&
          groups.map((group, index) => (
            <Link
              key={index}
              to={`/profile/groups/${group._id}`}
              className="block blockEl bg-slate-800"
            >
              <div className="font-xl font-bold px-2 flex gap-3 items-center">
                {moment(group.createdAt).locale("uk").format("DD MMM YYYY")}
                {group.image.length > 0 ? (
                  <img
                    src={group.image}
                    alt="groupAvatar"
                    className="w-16 h-16 rounded-full "
                  />
                ) : (
                  <FontAwesomeIcon
                    className="w-6 h-6 p-6 bg-slate-600 rounded-full"
                    icon={faUsers}
                  />
                )}
                <div className="flex flex-col gap-2 grow">
                  <span className="">{group.name}</span>
                  <div className="flex items-center gap-2">
                    {group.members.map((member, index) => (
                      <img
                        className="w-6 h-6 rounded-full"
                        src={member.image}
                        alt="useravatar"
                      />
                    ))}
                  </div>
                </div>
                {/* вираховує скільки ти винен в цій групі */}
                <span
                  className={`${
                    calculateNetTotalUser(group.expenses) > 0
                      ? "text-green-500"
                      : calculateNetTotalUser(group.expenses) == 0
                      ? "text-white"
                      : "text-red-500"
                  }`}
                >
                  {calculateNetTotalUser(group.expenses)}{" "}
                  {userdata.curency.curencyValue}
                </span>
              </div>
            </Link>
          ))}
        {!groups.length && (
          <div className="blockEl bg-slate-800">
            <span className="font-xl font-bold p-2 block">
              У вас ще немає груп
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Groups;

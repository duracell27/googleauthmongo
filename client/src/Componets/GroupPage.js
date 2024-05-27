import {
  faImage,
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
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../App";
import ExpenseForm from "./ExpenseForm";
import Transactions from "./Transactions";

const GroupPage = () => {
  //groupId
  const { id } = useParams();
  const { userdata } = useContext(AuthContext);

  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [settles, setSettles] = useState([]);
  const [settlesByUser, setSettlesByUser] = useState([]);
  const [settlesPayed, setSettlesPayed] = useState([]);

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
  // отримати всі витрати групи
  const getExpenses = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/expensesAll",
        {
          withCredentials: true,
          params: {
            groupId: id,
          },
        }
      );
      if (response.status === 200) {
        setExpenses(response.data);
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
  // розрахунок суми по витраті для користувача, винен він чи винні йому
  function calculateNetAmount(transactionObject, userId) {
    let landSum = 0;
    let oweSum = 0;

    // Iterate through the "land" array and sum up the amounts paid by the user
    transactionObject.land.forEach((land) => {
      if (land.user._id === userId) {
        landSum += land.sum;
      }
    });

    // Iterate through the "owe" array and sum up the amounts owed by the user
    transactionObject.owe.forEach((owe) => {
      if (owe.user._id === userId) {
        oweSum += owe.sum;
      }
    });

    // Calculate the net amount
    return (landSum - oweSum).toFixed(2);
  }

  // розраховує загальні витрати групи
  const calculateGroupTotal = () => {
    let groupTotal = 0;
    expenses.forEach((expense) => {
      groupTotal += expense.price;
    });

    return groupTotal.toFixed(2);
  };
  // розраховує загальні витрати користувача
  const calculateUserTotal = () => {
    let totalOwedSum = 0;
    expenses.forEach((expense) => {
      expense.owe.forEach((owe) => {
        if (owe.user._id === userdata._id) {
          totalOwedSum += owe.sum;
        }
      });
    });

    return totalOwedSum.toFixed(2);
  };
  // розраховує загальний баланс користувача в групі чи він винен чи ні
  const calculateNetTotalUser = () => {
    let netTotalUser = 0;
    expenses.forEach((expense) => {
      expense.land.forEach((land) => {
        if (land.user._id === userdata._id) {
          netTotalUser += land.sum;
        }
      });
      expense.owe.forEach((owe) => {
        if (owe.user._id === userdata._id) {
          netTotalUser -= owe.sum;
        }
      });
    });

    return netTotalUser.toFixed(2);
  };

  const getSettles = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/calculateSettle",
        {
          withCredentials: true,
          params: {
            groupId: id,
          },
        }
      );
      if (response.status === 200) {
      
        let settles =response.data.filter(settle=>settle.amount>0)
        let settlesPayed = response.data.filter(settle=>settle.settled>0)


        settles.forEach(unfiltered => {
          settlesPayed.forEach(payed => {
              if (unfiltered.ower._id === payed.ower._id && unfiltered.lender._id === payed.lender._id) {
                  unfiltered.amount -= payed.settled;
              }
          });
      });


        console.log('settles', settlesByUser)

        let sortedSettles = settles.sort((a, b) => {
          // Сортування за lender.displayName
          let nameA = a.lender.displayName.toLowerCase();
          let nameB = b.lender.displayName.toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
      
          // Якщо lender.displayName однакові, сортуємо за amount
          return a.amount - b.amount;
      })

        const settlesbyId = sortedSettles.filter(item => 
          item.lender._id === userdata._id || item.ower._id === userdata._id
      );
      

        setSettles(sortedSettles);
        setSettlesByUser(settlesbyId)
        setSettlesPayed(settlesPayed)
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
    getExpenses();
    getSettles();
  }, []);

  console.log(settles)
  console.log(settlesPayed)

  return (
    <div className="bg-green-600 h-screen">
      {/* cсекція з назвою лого і датою */}
      <div className="text-xl md:text-4xl font-bold mb-3 flex items-center gap-5">
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
          <span className="">{groupInfo?.name}</span>
          <p className="text-xl text-white/60">
            {moment(groupInfo?.createdAt).locale("uk").format("DD MMM YYYY")}
          </p>
        </span>
        {groupInfo?.members[0]?._id === userdata?._id ? (
          <div
            onClick={deleteGroupHandler}
            className="blockEl bg-green-800 text-sm md:text-xl cursor-pointer"
          >
            Видалити групу
          </div>
        ) : (
          ""
        )}
      </div>

      {/* основна секція з витратами та учасниками */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* секція з витратами */}
        <div className="blockEl bg-green-700 grow">
          
          <Transactions groupId={id} settles={settles} settlesPayed={settlesPayed} getSettles={getSettles} settlesByUser={settlesByUser}/>
        </div>
      </div>

      {/* основна секція з витратами та учасниками */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* секція з витратами */}
        <div className="blockEl bg-green-700 grow">
          <span className="font-xl font-bold mb-3 block">Витрати</span>
          <div className="flex flex-col md:flex-row gap-2 justify-between items-center">
            <button
              className="bg-slate-800 rounded-full p-2 px-4"
              onClick={() => setAddExpensePopup((prev) => !prev)}
            >
              <FontAwesomeIcon
                className="mr-2"
                icon={addExpensePopup ? faXmark : faPlus}
              />
              <span>Додати витрату</span>
            </button>
            <div className=" flex flex-col md:flex-row gap-2">
              <span className="bloclEl bg-slate-800 p-1 rounded-lg">
                Загальні витрати групи: {calculateGroupTotal()}{" "}
                {userdata.curency.curencyValue}
              </span>
              <span className="bloclEl bg-slate-800 p-1 rounded-lg">
                Ваші загальні витрати: {calculateUserTotal()}{" "}
                {userdata.curency.curencyValue}
              </span>
              <span
                className={`${
                  calculateNetTotalUser() > 0
                    ? "text-green-500"
                    : "text-red-500"
                } bloclEl bg-slate-800 p-1 rounded-lg`}
              >
                {calculateNetTotalUser() > 0 ? "Вам винні: " : "Ви винні"}{" "}
                {calculateNetTotalUser()} {userdata.curency.curencyValue}
              </span>{" "}
            </div>
          </div>

          {/* попап для створити витрату */}
          {addExpensePopup && (
            <ExpenseForm
              groupId={id}
              members={groupInfo.members}
              setAddExpensePopup={setAddExpensePopup}
              getExpenses={getExpenses}
              getSettles={getSettles}
              isCreate={true}
            />
          )}
          {/* вивід всіх витрати в групі */}
          {expenses.map((expense, index) => (
            <Link key={index} to={`/profile/expense/${expense._id}`}>
              <div
                
                className="blockEl bg-slate-800 flex flex-col md:flex-row items-center gap-3"
              >
                <span>
                  {moment(expense?.createdAt)
                    .locale("uk")
                    .format("DD MMM YYYY")}
                </span>
                {expense.image.length > 0 ? (
                  <img
                    src={expense.image}
                    className="w-16 h-16 rounded-full"
                    alt="expenseimg"
                  />
                ) : (
                  <span className="flex justify-center items-center bg-slate-600 w-16 h-16 rounded-full">
                    <FontAwesomeIcon icon={faImage} />
                  </span>
                )}

                <div className="flex flex-col gap-2 grow">
                  {/* вивід того хто оплатив */}
                  <span className="">{expense.name}</span>
                  {expense.landMulti === false ? (
                    <span className="text-slate-500 flex gap-2 items-center">
                      <img
                        className="w-6 h-6 rounded-full"
                        src={expense?.land[0]?.user?.image}
                        alt="avatar"
                      />
                      <span>{expense?.land[0]?.user?.displayName}</span>{" "}
                      {"оплат."} {expense?.land[0]?.sum}{" "}
                      {userdata.curency.curencyValue}
                      {/* {expense?.land[0]?.user?.curency?.curencyValue} */}
                    </span>
                  ) : (
                    //вивід аватарок хто платив
                    <span className="text-slate-500 flex gap-2 items-center">
                      {expense?.land?.map((user, index) => (
                        <img
                          key={index}
                          className="w-6 h-6 rounded-full"
                          src={user.user.image}
                        ></img>
                      ))}
                      <span>оплатили</span>
                      <span>
                        {expense?.price} {userdata.curency.curencyValue}
                      </span>
                    </span>
                  )}
                </div>
                {/* <div className="flex items-center gap-2">
                <span><FontAwesomeIcon icon={fa}/></span>
              </div> */}
                {/* вивід вашої частки оплати */}
                <span
                  className={`${
                    calculateNetAmount(expense, userdata?._id) < 0
                      ? "text-red-500"
                      : "text-green-400"
                  }`}
                >
                  <strong>
                    {calculateNetAmount(expense, userdata?._id)}{" "}
                    {userdata?.curency?.curencyValue}
                  </strong>
                </span>
              </div>
            </Link>
          ))}
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

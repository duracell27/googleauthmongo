import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  faCheck,
  faXmark,
  faUserPlus,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../App";
import toast from "react-hot-toast";

const Account = () => {
  const { userdata, getUserData} = useContext(AuthContext);

  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [friendSearch, setFriendSearch] = useState("");
  const [findedUsers, setFindedUsers] = useState([]);

  const [cardNumber, setCardNumber] = useState("");
  const [curencyList, setCurencyList] = useState([]);
  const [activeCurency, setActiveCurency] = useState("");
  const [languageList, setLanguageList] = useState([]);
  const [activeLanguage, setActiveLanguage] = useState("");

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
      toast.error(error?.response?.data);
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
     
    } catch (error) {
      toast.error(error?.response?.data);
      
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
        toast.success(response?.data?.message);
      }
      if (response.status === 404) {
        toast.error(response?.data?.message);
      }
    } catch (error) {
  
      toast.error(error?.response?.data);
    }
  };
  //форматування поля вводу картки грошей
  function cc_format(value) {
    const v = value
      .replace(/\s+/g, "")
      .replace(/[^0-9]/gi, "")
      .substr(0, 16);
    const parts = [];

    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substr(i, 4));
    }

    return parts.length > 1 ? parts.join(" ") : value;
  }
  //отримуємо списки мов та валют а також заповняємо дефолтні дані якщо вони є
  const getProfileInfo = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/profile/info",
        {
          params: {
            userId: userdata._id,
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setCurencyList(response.data.curency);
        setLanguageList(response.data.language);

        if (response.data.defCurency) {
          setActiveCurency(response.data.defCurency);
        }
        if (response.data.defLanguage) {
          setActiveLanguage(response.data.defLanguage);
        }
        if (response.data.defCardNumber) {
          setCardNumber(response.data.defCardNumber);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //зберігаємо валюту картку та мову і відповідності до вибраного whatToChange(curency,language,card)
  const saveSettings = async (id, whatToChange) => {
    try {
      const response = await axios.put(
        process.env.REACT_APP_BACK_URL + "/profile/settings",
        {
          id,
          whatToChange,
          userId: userdata._id,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        getUserData()
      }
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  //отримуємо ід валюти щоб змінити дані в ній
  const getCurrentCurencyId = () => {
    return curencyList.filter((c) => c.curencyValue === activeCurency)[0]?._id;
  };
  //отримуємо ід мови щоб змінити її
  const getCurrentLanguageId = () => {
    return languageList.filter((l) => l.langValue === activeLanguage)[0]?._id;
  };
  //зберігаємо в бд валюту
  const saveCurencyHandler = () => {
    const id = getCurrentCurencyId();
    if (!id) {
      toast.error("Валюта не була змінена");
      return;
    } else if (id) {
      saveSettings(id, "curency");
    }
  };
  //зберігаємо в бд мову
  const saveLanguageHandler = () => {
    const id = getCurrentLanguageId();
    if (!id) {
      toast.error("Мова не була змінена");
      return;
    } else if (id) {
      saveSettings(id, "language");
    }
  };
  //зберігаємо в бд номер карти
  const saveCardNumberHadler = () => {
    const cardNumber1 = cc_format(cardNumber);

    if (cardNumber1.length === 19) {
      saveSettings(cardNumber1, "card");
    } else {
      toast.error("Номер картки має бути 16 символів");
    }
  };

  //оновлюємо масив знайдених користувачів при вводі в поле пошуку користувача
  useEffect(() => {
    searchUsers();
  }, [friendSearch]);

  //загружаємо початкову інформацію про друзів та запити друзів
  useEffect(() => {
    getFriends();
    getProfileInfo();
  }, []);

  return (
    <div className="bg-green-600 h-screen">
      <h1 className="text-4xl font-bold">Акаунт</h1>
      <div className="blockEl bg-green-700 ">
        {/* секція друзі початок */}
        <div className="grid md:grid-cols-3 gap-2 md:gap-5 items-stretch">
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
                  referrerPolicy="no-referrer"
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
                  referrerPolicy="no-referrer"
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
              className="w-full rounded-xl indent-2 p-1 outline-none bg-slate-500"
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
                      referrerPolicy="no-referrer"
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
      <div className="blockEl bg-green-700">
        <div className="blockEl bg-slate-800">
          <span className="font-xl font-bold mb-3 block">Ваші витрати</span>
          <p>У вас ще немає витрат</p>
        </div>
      </div>
      {/* секція валюти */}
      <div className="blockEl bg-green-700">
        <div className="blockEl bg-slate-800">
          <span className="font-xl font-bold mb-3 block">Валюта</span>
          <select
            value={activeCurency}
            onChange={(e) => setActiveCurency(e.target.value)}
            className="bg-slate-600 p-1 px-2 outline-none rounded-xl"
          >
            {curencyList.length > 0 &&
              curencyList.map((currency, index) => (
                <option key={index} value={currency.curencyValue}>
                  {currency.curencyDesc}
                </option>
              ))}
          </select>
          <button
            onClick={() => saveCurencyHandler()}
            className="bg-green-800 rounded-full w-7 h-7 cursor-pointer ml-4"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        </div>
      </div>
      {/* секція картки */}
      <div className="blockEl bg-green-700">
        <div className="blockEl bg-slate-800">
          <span className="font-xl font-bold mb-3 block">
            Номер картки для повернення коштів
          </span>
          <input
            className="bg-slate-600 p-1 rounded-xl outline-none"
            type="text"
            placeholder="Номер карти"
            value={cc_format(cardNumber)}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <button
            onClick={() => saveCardNumberHadler()}
            className="bg-green-800 rounded-full w-7 h-7 cursor-pointer ml-4"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        </div>
      </div>
      {/* секція мови */}
      <div className="blockEl bg-green-700">
        <div className="blockEl bg-slate-800">
          <span className="font-xl font-bold mb-3 block">Заміна мови</span>
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="bg-slate-600 p-1 px-2 outline-none rounded-xl"
          >
            {languageList.length > 0 &&
              languageList.map((language, index) => (
                <option key={index} value={language.langValue}>
                  {language.langDesc}
                </option>
              ))}
          </select>
          <button
            onClick={() => saveLanguageHandler()}
            className="bg-green-800 rounded-full w-7 h-7 cursor-pointer ml-4"
          >
            <FontAwesomeIcon icon={faFloppyDisk} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;

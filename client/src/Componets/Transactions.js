import {
  faCashRegister,
  faCircleArrowRight,
  faCircleCheck,
  faCopy,
  faExclamationTriangle,
  faMoneyBillWave,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../App";

function Transactions({
  groupId,
  settles,
  settlesPayed,
  getSettles,
  settlesByUser,
}) {
  const { userdata } = useContext(AuthContext);
  const [showedSettles, setShowedSettles] = useState([]);
  const [detailsPopup, setDetailPopup] = useState(false);
  // створення виплати і записв бд
  const settleHandler = async (owerId, lenderId, inputId) => {
    const inputValue = window.document.querySelector(`#settleId${inputId}`);

    const settleData = {
      groupId: groupId,
      ower: owerId,
      lender: lenderId,
      settled: inputValue.value,
    };

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACK_URL + "/settle",
        settleData,
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        toast.success(response?.data?.message);
        setShowedSettles([]);
        getSettles();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  //   додавання і вилучення з масиву показу інпут полів для введення суми відплати
  const handleShowedSettles = (index) => {
    if (showedSettles.includes(index)) {
      setShowedSettles(showedSettles.filter((item) => item !== index));
    } else {
      setShowedSettles([...showedSettles, index]);
    }
  };
  //   видалення в запису відплати
  const handleSettlePayDelete = async (settleId) => {
    try {
      const response = await axios.delete(
        process.env.REACT_APP_BACK_URL + "/settle",
        {
          withCredentials: true,
          params: {
            settleId: settleId,
          },
        }
      );
      if (response.status === 200) {
        toast.success(response?.data?.message);
        setShowedSettles([]);
        getSettles();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {/* секція ваші розрахунки початок */}
      <div className="flex justify-center w-full">
        <div className="blockEl bg-green-800">
          <span className="font-xl font-bold mb-3 block">Ваші розрахунки</span>
          {settlesByUser.length ==0 && (
                <span className="bg-slate-800 px-2 rounded-full p-1" >Ви нікому не винні</span>
            )}
          <div className="flex flex-col gap-1">
            {settlesByUser?.length > 0 &&
              settlesByUser.map((transaction, index) => (
                <div key={index} className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:mb-0 items-center gap-2 rounded-lg">
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
                  <FontAwesomeIcon icon={faCircleArrowRight} />

                  {transaction.amount === 0 ? (
                    <div className="bg-slate-800 rounded-full pl-2 p-1 flex gap-2 items-center">
                      <span>Виплачено</span>
                      <FontAwesomeIcon
                        className="text-green-500 w-6 h-6"
                        icon={faCircleCheck}
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-800 rounded-full gap-2 pl-2 p-1 flex items-center">
                      <span
                        className={`${
                          userdata._id === transaction.lender._id
                            ? "text-green-500"
                            : "text-red-500"
                        } text-base`}
                      >
                        {transaction.amount} {userdata.curency.curencyValue}
                      </span>
                      {transaction.warn ? (
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-500 px-2 rounded-full flex gap-2 items-center">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <span>{transaction.warnId}</span>
                          </div>
                          <span
                            onClick={() => handleShowedSettles(`warn${index}`)}
                            className="bg-slate-600 rounded-full px-2"
                          >
                            інфо
                          </span>
                          <div
                            className={`${
                              showedSettles.includes(`warn${index}`)
                                ? "block"
                                : "hidden"
                            } flex gap-2`}
                          >
                            <span className="text-xs truncate">
                              {transaction.message}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <FontAwesomeIcon
                          onClick={() => handleShowedSettles(`user${index}`)}
                          className="cursor-pointer rounded-full bg-orange-500 p-1"
                          icon={faCashRegister}
                        />
                      )}
                    </div>
                  )}

                  <div
                    className={`${
                      showedSettles.includes(`user${index}`)
                        ? "block"
                        : "hidden"
                    } flex gap-2`}
                  >
                    <input
                      id={`settleId${transaction._id}`}
                      className="bg-slate-800 rounded-full p-1 max-w-[80px] outline-none indent-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      type="number"
                      placeholder="Сума"
                      defaultValue={transaction.amount}
                    />
                    {transaction.lender.cardNumber && (
                      <span className="bg-slate-800 flex gap-2 rounded-full px-1 pl-2 items-center">
                        {transaction.lender.cardNumber}{" "}
                        <FontAwesomeIcon
                          onClick={() => {
                            navigator.clipboard.writeText(
                              transaction.lender.cardNumber
                            );
                            toast.success("Номер карти скопійовано");
                          }}
                          className="bg-orange-500 p-1 rounded-full w-4 h-4 cursor-pointer"
                          icon={faCopy}
                        />
                      </span>
                    )}

                    <button
                      onClick={() =>
                        settleHandler(
                          transaction.ower._id,
                          transaction.lender._id,
                          transaction._id
                        )
                      }
                      className="bg-green-700 px-2 p-1 cursor-pointer rounded-full"
                    >
                      Виплатити
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      {/* секція ваші розрахунки кінець */}

      {/* секція всі розрахунки початок */}
      <button
        className="font-xl font-bold bg-green-800 p-1 px-2 rounded-full"
        onClick={() => setDetailPopup((prev) => !prev)}
      >
        {detailsPopup ? "Закрити" : "Подробиці"}
      </button>
      {detailsPopup && (
        <div className="flex flex-col md:flex-row justify-center gap-3 w-full">
          <div className="blockEl bg-green-800">
            <span className="font-xl font-bold mb-3 block">Всі розрахунки</span>
            {settles.length ==0 && (
                <span className="bg-slate-800 px-2 rounded-full p-1" >Додайте витрати, щоб отримати розрахунки</span>
            )}
            <div className="flex flex-col gap-1">
              {settles?.length > 0 &&
                settles.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:mb-0 items-center gap-2 rounded-lg"
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
                    <FontAwesomeIcon icon={faCircleArrowRight} />
                    {/* <FontAwesomeIcon icon={faCircleArrowRight} /> */}
                    {transaction.amount === 0 ? (
                      <div className="bg-slate-800 rounded-full pl-2 p-1 flex gap-2 items-center">
                        <span>Виплачено</span>
                        <FontAwesomeIcon
                          className="text-green-500 w-6 h-6"
                          icon={faCircleCheck}
                        />
                      </div>
                    ) : (
                      <div className="bg-slate-800 rounded-full gap-2 pl-2 p-1 flex items-center">
                        <span className="text-base ">
                          {transaction.amount} {userdata.curency.curencyValue}
                        </span>

                        <FontAwesomeIcon
                          onClick={() => handleShowedSettles(`all${index}`)}
                          className="cursor-pointer rounded-full bg-orange-500 p-1"
                          icon={faCashRegister}
                        />
                      </div>
                    )}

                    <div
                      className={`${
                        showedSettles.includes(`all${index}`)
                          ? "block"
                          : "hidden"
                      } flex gap-2`}
                    >
                      <input
                        id={`settleId${transaction._id}`}
                        className="bg-slate-800 rounded-full p-1 max-w-[80px] outline-none indent-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        placeholder="Сума"
                        defaultValue={transaction.amount}
                      />
                      {transaction.lender.cardNumber && (
                        <span className="bg-slate-800 flex gap-2 rounded-full px-1 pl-2 items-center">
                          {transaction.lender.cardNumber}{" "}
                          <FontAwesomeIcon
                            onClick={() => {
                              navigator.clipboard.writeText(
                                transaction.lender.cardNumber
                              );
                              toast.success("Номер карти скопійовано");
                            }}
                            className="bg-orange-500 p-1 rounded-full w-4 h-4 cursor-pointer"
                            icon={faCopy}
                          />
                        </span>
                      )}

                      <button
                        onClick={() =>
                          settleHandler(
                            transaction.ower._id,
                            transaction.lender._id,
                            transaction._id
                          )
                        }
                        className="bg-green-700 px-2 p-1 cursor-pointer rounded-full"
                      >
                        Виплатити
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* секція всі розрахунки кінець */}

          {/* секція з виплатами  початок */}
          <div className="blockEl bg-green-800">
            <span className="font-xl font-bold mb-3 block">Виплати</span>
            {settlesPayed.length ==0 && (
                <span className="bg-slate-800 px-2 rounded-full p-1" >Ніхто ще не оплатив свої борги</span>
            )}
            <div className="flex flex-col gap-1">
              {settlesPayed?.length > 0 &&
                settlesPayed.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex bg-green-900 md:bg-transparent p-2 md:p-0 flex-col md:flex-row mb-10 md:mb-0 items-center gap-2 rounded-lg"
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
                    <div className="bg-slate-800 rounded-full p-1 pl-2 flex gap-2 items-center">
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      <span className="text-base">
                        {transaction.settled} {userdata.curency.curencyValue}
                      </span>
                      <FontAwesomeIcon
                        className="bg-orange-500 p-1 w-4 h-4 rounded-full cursor-pointer"
                        onClick={() => handleSettlePayDelete(transaction._id)}
                        icon={faXmark}
                      />
                      {transaction.warn && (
                        <div className="flex items-center bg-orange-500 px-2 gap-2 rounded-full cursor-pointer">
                          <FontAwesomeIcon
                            className="w-4 h-4"
                            icon={faTriangleExclamation}
                          />
                          <span>{transaction.warnId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {/* секція з виплатами кінець */}
        </div>
      )}
    </div>
  );
}

export default Transactions;

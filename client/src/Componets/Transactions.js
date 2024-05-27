import {
  faCashRegister,
  faCircleArrowRight,
  faCircleCheck,
  faMoneyBillWave,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

import React, { useState } from "react";
import toast from "react-hot-toast";

function Transactions({ groupId, settles, settlesPayed, getSettles, settlesByUser }) {

  const [showedSettles, setShowedSettles] = useState([]);
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
        setShowedSettles([])
        getSettles();
        
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const handleShowedSettles = (index) => {
    if (showedSettles.includes(index)) {
      setShowedSettles(showedSettles.filter((item) => item !== index));
    } else {
      setShowedSettles([...showedSettles, index]);
    }
  };

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
          setShowedSettles([])
            getSettles()
        }
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
  }

  return (
    <div className="flex flex-col items-start gap-3">
        <span className="font-xl font-bold mb-3 block">Розрахунки</span>
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
            {/* <FontAwesomeIcon icon={faCircleArrowRight} /> */}
            {transaction.amount === 0 ? (
              <>
                <span>Виплачено</span>
                <FontAwesomeIcon icon={faCircleCheck} />
              </>
            ) : (
              <>
                <span className="text-xl font-bold">{transaction.amount}</span>

                <FontAwesomeIcon
                  onClick={() => handleShowedSettles(`all${index}`)}
                  className="cursor-pointer"
                  icon={faCashRegister}
                />
              </>
            )}

            <div className={showedSettles.includes(`all${index}`) ? "block" : "hidden"}>
              <input
                id={`settleId${transaction._id}`}
                className="bg-slate-600 rounded-lg indent-2"
                type="text"
                placeholder="Сума"
                defaultValue={transaction.amount}
              />
              <button
                onClick={() =>
                  settleHandler(
                    transaction.ower._id,
                    transaction.lender._id,
                    transaction._id
                  )
                }
                className="bg-green-700 px-2 rounded-lg"
              >
                Виплатити
              </button>
            </div>
          </div>
        ))}

<span className="font-xl font-bold mb-3 block">Виплати</span>

      {settlesPayed?.length > 0 &&
        settlesPayed.map((transaction, index) => (
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
            <FontAwesomeIcon icon={faMoneyBillWave} />
            <span className="text-xl font-bold">{transaction.settled}</span>
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
            <FontAwesomeIcon onClick={()=>handleSettlePayDelete(transaction._id)} icon={faXmark} />
          </div>
        ))}

<span className="font-xl font-bold mb-3 block">Розрахунки ваші</span>
{settlesByUser?.length > 0 &&
        settlesByUser.map((transaction, index) => (
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
            {/* <FontAwesomeIcon icon={faCircleArrowRight} /> */}
            {transaction.amount === 0 ? (
              <>
                <span>Виплачено</span>
                <FontAwesomeIcon icon={faCircleCheck} />
              </>
            ) : (
              <>
                <span className="text-xl font-bold">{transaction.amount}</span>

                <FontAwesomeIcon
                  onClick={() => handleShowedSettles(`user${index}`)}
                  className="cursor-pointer"
                  icon={faCashRegister}
                />
              </>
            )}

            <div className={showedSettles.includes(`user${index}`) ? "block" : "hidden"}>
              <input
                id={`settleId${transaction._id}`}
                className="bg-slate-600 rounded-lg indent-2"
                type="text"
                placeholder="Сума"
                defaultValue={transaction.amount}
              />
              <button
                onClick={() =>
                  settleHandler(
                    transaction.ower._id,
                    transaction.lender._id,
                    transaction._id
                  )
                }
                className="bg-green-700 px-2 rounded-lg"
              >
                Виплатити
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Transactions;

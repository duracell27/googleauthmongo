import { faCheck, faImage, faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import axios from "axios";
import toast from "react-hot-toast";

const ExpenseForm = ({
  groupId = "",
  members = [],
  setAddExpensePopup,
  getExpenses,
  existingExpense,
  isEdit,
  isCreate,
  getSettles
}) => {
  const { userdata } = useContext(AuthContext);

  
  const initExpenseState = {
    name: "",
    image: "",
    price: "",
    group: groupId,
    landMulti: false,
    land: [],
    oweType: "equaly",
    owe: [],
  };

  const [expense, setExpense] = useState(initExpenseState);
  // є 3 степи, 1,2,3, але для режиму перегляну є степ 4 коли відображаються всі етапи зразу
  const [expenseStep, setExpenseStep] = useState(4);

  // коли прилітає існуюча витрата то пустий стейт заміняється на заповнений даними
  useEffect(() => {
    if (existingExpense) {
      setExpense(existingExpense);
    }
  }, [existingExpense]);
  // реагує на змінну редагування, міняє інтерфес,і додає кнопки зберегти і так далі..
  useEffect(() => {
    if (isEdit || isCreate) {
      setExpenseStep(1);
    } else {
      setExpenseStep(4);
    }
  }, [isEdit]);



  //отримати полисання на фото групи від авс
  const expenseAvatarChange = async (e) => {
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
          setExpense({ ...expense, image: response.data });

        }
      } catch (error) {
        toast.error(error?.response?.data);
      }
    }
  };
  //основна логіка розділення сум тих хто платив і тих хто винен
  const handleCheckbox = (checked, userId, type) => {
    
    // основний іф який розділяє роботу з масивом оплат і масивом винних
    if (type === "land") {
      //робота з масивом, якщо одинична оплата
      if (expense.landMulti === false) {
        setExpense({
          ...expense,
          land: [{ user: userId, sum: expense.price }],
        });
      }
      //робота з масивом, якщо багато оплачували
      else if (expense.landMulti === true) {
        // додаємо в масив оплат якшо чекбокс натиснуто
        if (checked === true) {
          setExpense({
            ...expense,
            land: [...expense.land, { user: userId, sum: "" }],
          });
        }
        // видаляємо з масиву оплат якшо чекбокс не нажато
        else if (checked === false) {
            
          setExpense({
            ...expense,
            land: expense.land.filter((item) => item.user._id !== userId._id),
          });
        }
      }
    }
    // основний іф який розділяє роботу з масивом оплат і масивом винних
    else if (type === "owe") {
      //якщо вибрано розділити порівну
      if (expense.oweType === "equaly") {
        //якщо натиснуто то додати до масиву витрат витрату
        if (checked === true) {
          setExpense({ ...expense, owe: [...expense.owe, { user: userId }] });
        }

        //якщо віджато то видалити витрату з масиву
        else if (checked === false) {
          setExpense({
            ...expense,
            owe: expense.owe.filter((item) => item.user._id !== userId._id),
          });
        }
        setExpense((prevExp) => ({
          ...prevExp,
          owe: prevExp.owe.map((item) => ({
            ...item,
            sum: +prevExp.price / prevExp.owe.length,
          })),
        }));
      }
      // якщо вид витрати вибрано точно вказати суму
      else if (expense.oweType === "exact") {
        //якщо натиснуто то додати до масиву витрату
        if (checked === true) {
          
          setExpense({
            ...expense,
            owe: [...expense.owe, { user: userId, sum: "" }],
          });
        
        }
        //якщо віджато то видалити витрату з масиву
        else if (checked === false) {
          setExpense({
            ...expense,
            owe: expense.owe.filter((item) => item.user._id !== userId._id),
          });
        }
      }
    }
  };
  // додає всіх учасників групи в масив винних з розділеною сумою на всіх
  const setAllOweFromMembers = () => {
    setExpense({
      ...expense,
      owe: members.map((member) => ({ user: member })),
    });
    setExpense((prevExp) => ({
      ...prevExp,
      owe: prevExp.owe.map((item) => ({
        ...item,
        sum: +prevExp.price / prevExp.owe.length,
      })),
    }));
  };
  // видаляє всіх учасників групи з масиву винних з розділеною сумою на всіх
  const deleteAllFromExpOwe = () => {
    setExpense({ ...expense, owe: [] });
    // setExpense(prevExp=> ({...prevExp, owe: prevExp.owe.map((item) => ({...item, sum: +prevExp.price / prevExp.owe.length}))}))
  };
  // обраховує частку витрати між вибраними користувачами
  const calculateEquilyOweSums = () => {
    if (expense.owe.length > 0) {
      return (+expense.price / expense.owe.length).toFixed(2);
    }
    return "виберіть когось щоб визначити частку";
  };
  // обраховує скільки ще коштів треба розділити щоб зійшлась сума тих хто платив за витрату
  const calculateMultipleSumm = () => {
    let summ = 0;
    expense.land.forEach((item) => {
      summ += +item.sum;
    });
    return +expense.price - summ;
  };
  // обраховує скільки ще коштів треба розділити щоб зійшлась сума тих хто винен
  const calculateRemainingAmount = () => {
    let summ = 0;
    expense.owe.forEach((item) => {
      summ += +item.sum;
    });
    return +expense.price - summ;
  };
  // вписує суму до юзера який оплачував, при вибраній спільній оплаті
  const addSumToLand = (summ, userId) => {
    setExpense({
      ...expense,
      land: expense.land.map((item) =>
        item.user._id === userId ? { ...item, sum: summ } : item
      ),
    });
  };
  // вписує суму до юзера який винний, при вибраній точіній оплаті
  const addSumToOwe = (summ, userId) => {
    setExpense({
      ...expense,
      owe: expense.owe.map((item) =>
        item.user._id === userId ? { ...item, sum: summ } : item
      ),
    });
  };
  // зберігає в БД всі дані по витраті
  const handleSaveExpense = () => {
    // якщо сет тайп в режимі едіт то йде редагування витрати
    if (isEdit) {
      axios
        .put(
          process.env.REACT_APP_BACK_URL + "/expenses",
          { expense, expenseId: expense._id },
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          if (response.status === 200) {
            toast.success(response.data.message);
            // setExpense(initExpenseState);
            // setAddExpensePopup(false);
            // getExpenses()
          }
        })
        .catch((error) => {
          toast.error(error?.response?.data);
        });
    }
    // якщо сет тайп в режимі НЕ едіт то йде створення витрати
    else {
      axios
        .post(process.env.REACT_APP_BACK_URL + "/expenses", expense, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.status === 200) {
            toast.success("Витрата створена");
            setExpense(initExpenseState);
            setAddExpensePopup(false);
            getExpenses();
            getSettles()
          }
        })
        .catch((error) => {
          toast.error(error?.response?.data);
        });
    }
  };

  return (
    <div className="flex blockEl bg-green-500 flex-col gap-5 mt-5">
      {/* перший блок де вносять назву фото так суму початок */}
      {(expenseStep === 1 || expenseStep === 4) && (
        <div className="blockEl bg-green-700 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="">
              <label
                className={`${
                  expense?.image?.length > 0
                    ? "p-0 w-20 h-20 rounded-full"
                    : " rounded-full p-6 w-20 h-20 flex justify-center items-center"
                } bg-gray-800 cursor-pointer`}
              >
                {expense?.image?.length > 0 && (
                  <img
                    src={expense.image}
                    className="object-cover rounded-full w-20 h-20"
                    alt="expenseimg"
                  />
                )}
                {expense?.image?.length < 1 && (
                  <div>
                    <FontAwesomeIcon icon={faImage} />
                  </div>
                )}

                <input
                  type="file"
                  onChange={expenseAvatarChange}
                  className="hidden"
                  disabled={!(isEdit || isCreate)}
                />
              </label>
            </div>
            <div className="">
              <label className="flex flex-col items-start gap-1">
                <span>Назва витрати:</span>
                <input
                  className="bg-slate-800 rounded-lg outline-none indent-1"
                  value={expense.name}
                  type="text"
                  name="name"
                  placeholder="Назва"
                  onChange={(e) =>
                    setExpense({ ...expense, name: e.target.value })
                  }
                  disabled={!(isEdit || isCreate)}
                />
              </label>

              <label className="flex flex-col items-start gap-1">
                <span>Сума витрати:</span>
                <input
                  className="bg-slate-800 rounded-lg outline-none indent-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={expense.price}
                  type="number"
                  name="price"
                  placeholder="Сума"
                  onChange={(e) =>
                    setExpense({ ...expense, price: e.target.value })
                  }
                  disabled={!(isEdit || isCreate)}
                />
              </label>
            </div>
          </div>
          {expenseStep !== 4 && (
            <div className="flex gap-2">
              <button
                disabled={!(expense.name !== "" && expense.price !== "")}
                onClick={() => setExpenseStep(2)}
                className="bg-slate-800 p-2 cursor-pointer rounded-full px-3 disabled:bg-slate-500"
              >
                Далі
              </button>
            </div>
          )}
        </div>
      )}

      {/* перший блок де вносять назву фото так суму кінець*/}

      {/* другий блок де визначається хто оплачував початок */}
      {(expenseStep === 2 || expenseStep === 4) && (
        <div className="blockEl bg-green-700 flex flex-col gap-2">
          <p className="font-bold">Хто оплачував?</p>
          <div className="flex gap-5">
            <span className="bg-slate-800 p-2  rounded-full px-3">
              {expense.landMulti ? "Спільна оплата" : "Одининочна оплата"}
            </span>
            <button
              className="bg-orange-700 p-1 cursor-pointer rounded-full px-2"
              onClick={() =>
                setExpense({
                  ...expense,
                  landMulti: !expense.landMulti,
                  land: [],
                })
              }
            >
              змінити
            </button>
          </div>
          {expense.landMulti && (
            <span>
              залишилось розділити:{" "}
              <span
                className={`${
                  calculateMultipleSumm() > 0
                    ? "text-green-500"
                    : calculateMultipleSumm() == 0
                    ? "text-white"
                    : "text-red-500"
                } font-bold`}
              >
                {calculateMultipleSumm()}
              </span>{" "}
            </span>
          )}
          <div className="blocEl flex flex-col items-start gap-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-start gap-2 bg-green-800 p-1 rounded-full"
              >
                <img
                  src={member?.image}
                  alt="avatar"
                  className="w-12 h-12 rounded-full"
                />
                <span>{member.displayName}</span>
                {expense.landMulti ? (
                  <>
                  <div className="relative">
                    <input
                      onChange={(e) => {
                        handleCheckbox(e.target.checked, member, "land");
                      }}
                      defaultChecked={expense.land.some(
                        (obj) => obj.user._id === member._id
                      )}
                      type="checkbox"
                      name="land"
                      disabled={!(isEdit || isCreate)}
                      className="hidden peer "
                      id={`landmulti${member._id}`}
                    />
                    <label htmlFor={`landmulti${member._id}`} className="bg-transparent block w-5 h-5 rounded-lg border mr-2 border-white peer-checked:bg-slate-800" ></label>
                    <span className="hidden pointer-events-none -top-[2px] left-[3px] absolute peer-checked:block rounded-full"><FontAwesomeIcon className=" w-4 h-4" icon={faCheck}/></span>
                    </div>

                    <input
                      type="number"
                      value={
                        expense.land.filter(
                          (obj) => obj.user._id === member._id
                        )[0]?.sum
                      }
                      disabled={!(isEdit || isCreate)}
                      onChange={(e) => addSumToLand(e.target.value, member._id)}
                      placeholder="Сума"
                      className="bg-slate-800 indent-1 rounded-lg w-14 mr-2 outline-none disabled:bg-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </>
                ) : (
                  <div className="relative">

                    <input
                      id={`landsingle${member._id}`}
                      className="mr-3 hidden peer"
                      onChange={(e) =>
                        handleCheckbox(e.target.checked, member, "land")
                      }
                      type="radio"
                      disabled={!(isEdit || isCreate)}
                      checked={expense.land.some(
                        (obj) => obj?.user?._id === member._id
                      )}
                      name="land"
                      
                    />
                    
                        
                    <label htmlFor={`landsingle${member._id}`} className="bg-transparent block w-5 h-5 rounded-full border mr-2 border-white peer-checked:bg-slate-800" ></label>
                    <span className="hidden pointer-events-none -top-[2px] left-[3px] absolute peer-checked:block rounded-full"><FontAwesomeIcon className="z-10 w-4 h-4" icon={faCheck}/></span>
                    
                    
                  </div>
                )}
              </div>
            ))}
          </div>
          {expenseStep !== 4 && (
            <div className="flex gap-2">
              <button
                onClick={() => setExpenseStep(1)}
                className="bg-slate-800 p-2 cursor-pointer rounded-full px-3"
              >
                назад
              </button>
              <button
                disabled={calculateMultipleSumm() !== 0}
                onClick={() => setExpenseStep(3)}
                className="bg-slate-800 p-2 cursor-pointer rounded-full px-3 disabled:bg-slate-600"
              >
                далі
              </button>
            </div>
          )}
        </div>
      )}

      {/* другий блок де визначається хто оплачував кінець */}

      {/* третій блок де визначається хто скілки винен початок */}
      {(expenseStep === 3 || expenseStep === 4) && (
        <div className="blockEl bg-green-700 flex flex-col gap-2">
          <p className="font-bold">як розділити</p>
          <div className="flex gap-5">
            <span className="bg-slate-800 p-2 rounded-full px-3 ">
              {expense.oweType === "equaly"
                ? "Порівно"
                : expense.oweType === "exact"
                ? "Вписати власноруч"
                : ""}
            </span>
            <button
              className="bg-orange-700 p-2 cursor-pointer rounded-full px-2"
              onClick={() =>
                setExpense({ ...expense, oweType: "equaly", owe: [] })
              }
            >
              Порівно
            </button>
            <button
              className="bg-orange-700 p-2 cursor-pointer rounded-full px-2"
              onClick={() =>
                setExpense({ ...expense, oweType: "exact", owe: [] })
              }
            >
              Вписати власноруч
            </button>
          </div>
          {expense.oweType === "equaly" && (
            <div className="flex flex-col items-start">
              <span>частка кожного: {calculateEquilyOweSums()}</span>
              <div className="flex gap-2 items-center my-1">
                <button
                  onClick={setAllOweFromMembers}
                  className="bg-slate-800 p-2 rounded-full px-3 "
                >
                  вибрати всіх
                </button>
                <button
                  onClick={deleteAllFromExpOwe}
                  className="bg-slate-800 p-2 rounded-full px-3 "
                >
                  видалити всіх
                </button>
              </div>
            </div>
          )}
          {expense.oweType === "exact" && (
            <div className="flex flex-col items-start">
              <span>
                залишилось розділити:{" "}
                <span
                  className={`${
                    calculateRemainingAmount() > 0
                      ? "text-green-500"
                      : calculateRemainingAmount() == 0
                      ? "text-white"
                      : "text-red-500"
                  } font-bold`}
                >
                  {calculateRemainingAmount()}
                </span>
              </span>
            </div>
          )}

          <div className="blocEl flex flex-col items-start gap-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex items-center justify-start gap-2 bg-green-800 p-1 rounded-full"
              >
                <img
                  src={member?.image}
                  alt="avatar"
                  className="w-12 h-12 rounded-full"
                />
                <span>{member.displayName}</span>
                {expense.oweType === "exact" ? (
                  <>
                  <div className="relative">
                    <input
                      className="mr-3 hidden peer"
                      id={`oweex${member._id}`}
                      onChange={(e) => {
                        handleCheckbox(e.target.checked, member, "owe");
                      }}
                      defaultChecked={expense.owe.some(
                        (obj) => obj.user.id === member._id
                      )}
                      type="checkbox"
                      name="owe"
                      disabled={!(isEdit || isCreate)}
                    />
                    <label htmlFor={`oweex${member._id}`} className="bg-transparent block w-5 h-5 rounded-lg border mr-2 border-white peer-checked:bg-slate-800" ></label>
                    <span className="hidden pointer-events-none -top-[2px] left-[3px] absolute peer-checked:block rounded-full"><FontAwesomeIcon className="z-10 w-4 h-4" icon={faCheck}/></span>

</div>
                    <input
                      type="number"
                      value={
                        expense.owe.filter(
                          (obj) => obj.user._id === member._id
                        )[0]?.sum
                      }
                      disabled={!(isEdit || isCreate)}
                      onChange={(e) => addSumToOwe(e.target.value, member._id)}
                      placeholder="Сума"
                      className="bg-slate-800 indent-1 rounded-lg w-14 mr-2 outline-none disabled:bg-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </>
                ) : (
                    <div className="relative">
                  <input
                    
                    onChange={(e) =>
                      handleCheckbox(e.target.checked, member, "owe")
                    }
                    disabled={!(isEdit || isCreate)}
                    type="checkbox"
                    checked={expense.owe.some(
                      (obj) => obj.user._id === member._id
                    )}
                    name="owe"
                    className="mr-3 hidden peer"
                      id={`oweeq${member._id}`}
                  />
                  <label htmlFor={`oweeq${member._id}`} className="bg-transparent block w-5 h-5 rounded-lg border mr-2 border-white peer-checked:bg-slate-800" ></label>
                    <span className="hidden pointer-events-none -top-[2px] left-[3px] absolute peer-checked:block rounded-full"><FontAwesomeIcon className="z-10 w-4 h-4" icon={faCheck}/></span></div>
                )}
              </div>
            ))}
          </div>
          {expenseStep !== 4 && (
            <div className="flex gap-2">
              <button
                onClick={() => setExpenseStep(2)}
                className="bg-slate-800 p-2 cursor-pointer rounded-full px-3"
              >
                назад
              </button>
            </div>
          )}
        </div>
      )}

      {/* третій блок де визначається хто скілки винен кінець */}

      {/* кнопка зберігання */}
      {expenseStep !== 4 && (
        <button
          disabled={
            !(
              expense.owe.length > 0 &&
              expense.land.length > 0 &&
              expense.name !== "" &&
              expense.price !== "" &&
              calculateRemainingAmount() == 0 &&
              calculateMultipleSumm() == 0
            )
          }
          className="bg-slate-800 rounded-full p-2 px-4 cursor-pointer disabled:bg-slate-500"
          onClick={handleSaveExpense}
        >
          {isCreate?'Зберегти': isEdit? 'Відредагувати': 'Зберегти'}
          {/* {isEdit ? "Відредагувати" : "Зберегти"} */}
        </button>
      )}
    </div>
  );
};

export default ExpenseForm;

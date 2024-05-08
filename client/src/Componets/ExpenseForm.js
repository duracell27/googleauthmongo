import { faReceipt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";

const ExpenseForm = ({ groupId, members }) => {
  const { userdata } = useContext(AuthContext);

  const initExpenseState = {
    name: "test",
    image: "",
    price: "54",
    group: groupId,
    landMulti: true,
    land: [
      { user: "662fd064af3b75b643342b8a", sum: "45" },
      { user: "6633d12db14b9246bef9463b", sum: "7" },
    ],
    oweType: "equaly",
    owe: [],
  };
  const [expense, setExpense] = useState(initExpenseState);

  //   useEffect(() => {
  //     setExpense({
  //       ...expense,
  //       land: [{ user: expense.land[0].user, sum: expense.price }],
  //     });
  //   }, [expense.price]);

  console.log("expense", expense);

  const handleCheckbox = (checked, userId, type) => {
    console.log("checked", checked);
    console.log("userId", userId);
    console.log("type", type);

    if (type === "land") {
      if (expense.landMulti === false) {
        setExpense({
          ...expense,
          land: [{ user: userId, sum: expense.price }],
        });
      } else if (expense.landMulti === true) {
        if (checked === true) {
          setExpense({
            ...expense,
            land: [...expense.land, { user: userId, sum: "0" }],
          });
        } else if (checked === false) {
          setExpense({
            ...expense,
            land: expense.land.filter((item) => item.user !== userId),
          });
        }
      }
    } else if (type === "owe") {
      if (expense.oweType === "equaly") {
        if (checked === true) {
          setExpense({ ...expense, owe: [...expense.owe, { user: userId}] });
        //   setExpense(prevExp=> ({...prevExp, owe: prevExp.owe.map((item) => ({...item, sum: +prevExp.price / prevExp.owe.length}))}))
        } else if (checked === false) {
          setExpense({...expense, owe: expense.owe.filter((item) => item.user !== userId)});
        }
        setExpense(prevExp=> ({...prevExp, owe: prevExp.owe.map((item) => ({...item, sum: +prevExp.price / prevExp.owe.length}))}))
      }
    }
  };

  const setAllOweFromMembers = ()=>{
    setExpense({ ...expense, owe: members.map((member) => ({user: member._id}))});
    setExpense(prevExp=> ({...prevExp, owe: prevExp.owe.map((item) => ({...item, sum: +prevExp.price / prevExp.owe.length}))}))
  }
  const deleteAllFromExpOwe = () =>{
    setExpense({...expense, owe: []})
    // setExpense(prevExp=> ({...prevExp, owe: prevExp.owe.map((item) => ({...item, sum: +prevExp.price / prevExp.owe.length}))}))
  }

  const calculateEquilyOweSums = () => {
    if(expense.owe.length>0){
        return +expense.price / expense.owe.length
    }
    return 'виберіть когось щоб визначити частку'
  };

  const calculateMultipleSumm = () => {
    let summ = 0;
    expense.land.forEach((item) => {
      summ += +item.sum;
    });
    return +expense.price - summ;
  };

  const addSumToLand = (summ, userId) => {
    setExpense({
      ...expense,
      land: expense.land.map((item) =>
        item.user === userId ? { ...item, sum: summ } : item
      ),
    });
  };

  return (
    <div className="flex flex-col gap-5 mt-5">
      <label>
        <span>Назва витрати:</span>
        <input
          className="bg-slate-600"
          value={expense.name}
          type="text"
          name="name"
          placeholder="Назва"
          onChange={(e) => setExpense({ ...expense, name: e.target.value })}
        />
      </label>

      <label className=" bg-cyan-600 p-6 w-16 h-16">
        <div>
          <FontAwesomeIcon icon={faReceipt} />
        </div>
        <input type="file" className="hidden" />
      </label>

      <label>
        <span>Сума витрати:</span>
        <input
          className="bg-slate-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={expense.price}
          type="number"
          name="price"
          placeholder="Сума"
          onChange={(e) => setExpense({ ...expense, price: e.target.value })}
        />
      </label>

      <p>хто оплачував</p>
      <div className="flex gap-5">
        <span className="bg-slate-600">
          {expense.landMulti ? "Спільна оплата" : "Одининочна оплата"}
        </span>{" "}
        <button
          className="bg-slate-700"
          onClick={() =>
            setExpense({ ...expense, landMulti: !expense.landMulti, land: [] })
          }
        >
          змінити
        </button>
      </div>
      {expense.landMulti && <span>{calculateMultipleSumm()}</span>}
      <div className="blocEl">
        {members.map((member, index) => (
          <div key={index} className="flex items-center">
            <img
              src={member?.image}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />{" "}
            <span>{member.displayName}</span>
            {expense.landMulti ? (
              <>
                <input
                  id={`checkboxfor${member._id}`}
                  onChange={(e) => {
                    handleCheckbox(e.target.checked, member._id, "land");
                    addSumToLand("0", member._id);
                  }}
                  defaultChecked={expense.land.some(
                    (obj) => obj.user === member._id
                  )}
                  type="checkbox"
                  name="land"
                />{" "}
                {/* {console.log(document.querySelector(`#checkboxfor${member._id}`)?.checked)} */}
                {/* disabled={!document.querySelector(`#checkboxfor${member._id}`)?.checked} */}
                <input
                  type="number"
                  value={
                    expense.land.filter((obj) => obj.user === member._id)[0]
                      ?.sum
                  }
                  onChange={(e) => addSumToLand(e.target.value, member._id)}
                  placeholder="Сума"
                  className="bg-slate-600 disabled:bg-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </>
            ) : (
              <input
                onChange={(e) =>
                  handleCheckbox(e.target.checked, member._id, "land")
                }
                type="radio"
                defaultChecked={expense.land.some(
                  (obj) => obj.user === member._id
                )}
                name="land"
              />
            )}
          </div>
        ))}
      </div>

      <p>як розділити</p>
      <div className="flex gap-5">
        <span className="bg-slate-600">
          {expense.oweType === "equaly"
            ? "Порівно"
            : expense.oweType === "exact"
            ? "Вписати власноруч"
            : ""}
        </span>
        <button
          className="bg-slate-700"
          onClick={() => setExpense({ ...expense, oweType: "equaly", owe: [] })}
        >
          Порівно
        </button>
        <button
          className="bg-slate-700"
          onClick={() => setExpense({ ...expense, oweType: "exact", owe: [] })}
        >
          Вписати власноруч
        </button>
      </div>
      {expense.oweType === "equaly" && <div className="flex flex-col items-start"><span>частка кожного: {calculateEquilyOweSums()}</span>
      <button onClick={setAllOweFromMembers} className="bg-slate-600">вибрати всіх</button>
      <button onClick={deleteAllFromExpOwe} className="bg-slate-600">видалити всіх</button>
      </div>}

      <div className="blocEl">
        {members.map((member, index) => (
          <div key={index} className="flex items-center">
            <img
              src={member?.image}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />{" "}
            <span>{member.displayName}</span>
            {expense.oweType === "exact" ? (
              <>
                <input
                  id={`checkboxfor${member._id}`}
                  onChange={(e) => {
                    handleCheckbox(e.target.checked, member._id, "land");
                    addSumToLand("0", member._id);
                  }}
                  defaultChecked={expense.land.some(
                    (obj) => obj.user === member._id
                  )}
                  type="checkbox"
                  name="land"
                />{" "}
                {/* {console.log(document.querySelector(`#checkboxfor${member._id}`)?.checked)} */}
                {/* disabled={!document.querySelector(`#checkboxfor${member._id}`)?.checked} */}
                <input
                  type="number"
                  value={
                    expense.land.filter((obj) => obj.user === member._id)[0]
                      ?.sum
                  }
                  onChange={(e) => addSumToLand(e.target.value, member._id)}
                  placeholder="Сума"
                  className="bg-slate-600 disabled:bg-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </>
            ) : (
              <input
                onChange={(e) =>
                  handleCheckbox(e.target.checked, member._id, "owe")
                }
                type="checkbox"
                defaultChecked={expense.owe.some(
                  (obj) => obj.user === member._id
                )}
                name="land"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseForm;

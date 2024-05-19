import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ExpenseForm from "./ExpenseForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const ShowExpense = () => {
  const { id } = useParams();
  const initExpenseState = {
    name: "",
    image: "",
    price: "",
    group: "",
    landMulti: false,
    land: [],
    oweType: "equaly",
    owe: [],
  };

  const [expense, setExpense] = useState(initExpenseState);
  const [isExpenseEdit, setIsExpenseEdit] = useState(false); 

  let navigate = useNavigate()
  // отримуємо дані про витрату по її ід щоб переглядати іінформацію витрати
  const getExpenseInfo = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_BACK_URL + "/expenses",
        {
          withCredentials: true,
          params: {
            expenseId: id,
          },
        }
      );
      setExpense(response.data);
    } catch (error) {
      toast.error(error?.response?.data);
    }
  };
  // при натисканні кнопки видалити, видалямо витрату
  const deleteExpense = async () => {
   const deleteConfirm = window.confirm('Are you sure you want to delete')
   if(deleteConfirm){
    try {
        const response = await axios.delete(
          process.env.REACT_APP_BACK_URL + "/expenses",
          {
            withCredentials: true,
            params: {
              expenseId: id,
            },
          }
        );
        if (response.status === 200) {
          toast.success(response.data.message);
          navigate(-1)
        }
      } catch (error) {
        toast.error(error?.response?.data);
      }
   }
    
  }
  // при початковій загрузці сторіники, загружаємо інформацію про витрату
  useEffect(() => {
    getExpenseInfo();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-bold">Перегляд витрати</p>
        {/* дві кнопки, редагувати та видалити витрату */}
        <div className="flex gap-2">
            <button onClick={()=>setIsExpenseEdit(prev=>!prev)} className="blocEl bg-slate-800 p-1 px-2 rounded-full cursor-pointer"><FontAwesomeIcon icon={faPenToSquare}/>{" "} {isExpenseEdit?"Скасувати":'Редагувати'} </button>
            <button onClick={deleteExpense} className="blocEl bg-red-800 p-1 px-2 rounded-full cursor-pointer"><FontAwesomeIcon icon={faTrashCan}/>{" "} Видалити</button>
        </div>
      </div>
      {/* форма додавання і перегляду витрати, спільна */}
      <ExpenseForm
        groupId={expense?.group?._id}
        members={expense?.group?.members}
        existingExpense={expense}
        isEdit={isExpenseEdit}
      />
    </div>
  );
};

export default ShowExpense;

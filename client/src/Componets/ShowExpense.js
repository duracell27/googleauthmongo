import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ExpenseForm from './ExpenseForm';

const ShowExpense = () => {
    const { id } = useParams();
    const initExpenseState = {
        name: "",
        image: "",
        price: "",
        group: '',
        landMulti: false,
        land: [],
        oweType: "equaly",
        owe: [],
      };

    const [expense, setExpense] = useState(initExpenseState);

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
            setExpense(response.data)
          } catch (error) {
            toast.error(error?.response?.data);
          }
    }

    useEffect(()=>{
        getExpenseInfo()
    },[])

  return (
    <div>ShowExpense

        <ExpenseForm existingExpense={expense}/>
    </div>
  )
}

export default ShowExpense
import { Route, Routes } from 'react-router-dom'
import Home from './Componets/Home'
import Login from './Componets/Login'
import Error from './Componets/Error'
import Headers from './Componets/Headers'
import Profile from './Componets/Profile'
import Friends from './Componets/Friends'
import Groups from './Componets/Groups'
import AddExpense from './Componets/AddExpense'
import Account from './Componets/Account'
import { createContext, useEffect, useState } from 'react'
import axios from 'axios'
import  { Toaster } from 'react-hot-toast';

export const AuthContext = createContext()

function App() {
  const [userdata, setUserdata] = useState({});

  // отримуємо інформацію про залогіненого користувача
  const getUser = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_BACK_URL + "/login/success", {
        withCredentials: true,
      });

      setUserdata(response.data.user);
    } catch (error) {
      console.log("errorHeaders");
    }
  };
//отримуємо початкову інформацію чи юзер залогінений
  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
    <AuthContext.Provider value={{userdata, setUserdata}}>
    <Toaster/>
    <Headers/>
      {userdata._id ? (
        <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/profile' element={<Profile/>}>
          <Route path='friends' element={<Friends/>}/>
          <Route path='groups' element={<Groups/>}/>
          <Route path='addexpense' element={<AddExpense/>}/>
          <Route path='account' element={<Account/>}/>
        </Route>
        <Route path='*' element={<Error/>}/>
      </Routes>
      ):(
        <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='*' element={<Error/>}/>
    </Routes>
      )}
    </AuthContext.Provider>
    </>
  );
}

export default App;

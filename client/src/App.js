import { Route, Routes } from "react-router-dom";
import Home from "./Componets/Home";
import Login from "./Componets/Login";
import Error from "./Componets/Error";
import Headers from "./Componets/Headers";
import Profile from "./Componets/Profile";
import Friends from "./Componets/Friends";
import Groups from "./Componets/Groups";
import AddExpense from "./Componets/AddExpense";
import Account from "./Componets/Account";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import GroupPage from "./Componets/GroupPage";
import ShowExpense from "./Componets/ShowExpense";

export const AuthContext = createContext();

function App() {
  const [userdata, setUserdata] = useState({});
 

  const checkUser = () => {
    if (sessionStorage.getItem("user")) {
      setUserdata(JSON.parse(sessionStorage.getItem("user")));
    }
  }
  //отримуємо початкову інформацію чи юзер залогінений
  useEffect(() => {
    checkUser()
  }, []);

  console.log('userData', userdata)

  return (
    <>
      <AuthContext.Provider value={{ userdata, setUserdata }}>
        <Toaster />
        <Headers />
        {userdata._id ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />}>
              <Route path="friends" element={<Friends />} />
              <Route path="groups" element={<Groups />} />
              <Route path="groups/:id" element={<GroupPage />} />
              <Route path="expense" element={<AddExpense />} />
              <Route path="expense/:id" element={<ShowExpense />} />
              <Route path="account" element={<Account />} />
            </Route>
            <Route path="*" element={<Error />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Error />} />
          </Routes>
        )}
      </AuthContext.Provider>
    </>
  );
}

export default App;

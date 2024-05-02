import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../App";

const Headers = () => {
  
  const {userdata} = useContext(AuthContext)

  const logout = () => {
    window.open(process.env.REACT_APP_BACK_URL + "/logout", "_self");
  };
  


  return (
    <header>
      <nav className="flex justify-between items-center p-2 bg-green-600 text-white">
        <NavLink to={"/"}>
          <h1 className="font-bold text-2xl">LandOwer</h1>
        </NavLink>

        {Object.keys(userdata).length ? (
          <div className="flex gap-2 items-center">
            <NavLink to={"/profile"} className='p-1 flex gap-2 bg-green-700 rounded-full pl-2'>
              <span>{userdata?.displayName}</span>
              <img
                className="w-6 h-6 rounded-full"
                src={userdata?.image}
                alt="userlogo"
                referrerpolicy="no-referrer"
              />
            </NavLink>

            <button onClick={logout} className="bg-slate-800 p-1 px-2 font-bold rounded-xl">
              Вийти
            </button>
          </div>
        ) : (
          <NavLink className="p-2 rounded-md bg-green-700 font-bold" to={"/login"}>
            Вхід
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Headers;

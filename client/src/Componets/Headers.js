import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const Headers = () => {
  const [userdata, setUserdata] = useState({});
  const getUser = async () => {
    try {
      const response = await axios.get("http://localhost:5050/login/success", {
        withCredentials: true,
      });

      setUserdata(response.data.user);
    } catch (error) {
      console.log("error");
    }
  };

  const logout = () => {
    window.open("http://localhost:5050/logout", "_self");
  };
  console.log(userdata);
  useEffect(() => {
    getUser();
  }, []);

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
              />
            </NavLink>

            <button onClick={logout} className="bg-green-700 p-2 font-bold rounded-xl">
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

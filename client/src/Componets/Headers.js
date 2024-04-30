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
      <nav className="flex justify-between p-2 bg-green-600 text-white">
        <h1>LandOwer</h1>
        <ul className="flex gap-2 items-center">
          <li className="p-2 rounded-md bg-green-700">
            <NavLink to={"/"}>Home</NavLink>
          </li>

          <li className="p-2 rounded-md bg-green-700">
            <NavLink to={"/dashboard"}>Dashboard</NavLink>
          </li>
        </ul>
        {Object.keys(userdata).length ? (
          <div className="flex gap-2 items-center">
            {userdata?.displayName}
            <img
              className="w-6 h-6 rounded-full"
              src={userdata?.image}
              alt="userlogo"
            />
            <button onClick={logout} className="bg-green-800 p-2">
              LogOut
            </button>
          </div>
        ) : (
          <NavLink className="p-2 rounded-md bg-green-700" to={"/login"}>
            Login
          </NavLink>
        )}
      </nav>
    </header>
  );
};

export default Headers;

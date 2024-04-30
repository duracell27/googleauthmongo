import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
const Login = () => {
  const loginWithGoogle = () => {
    window.open("http://localhost:5050/auth/google/callback", "_self");
  };
  return (
    <div className="bg-green-500 h-screen">
      <div class="flex flex-col gap-1 justify-evenly items-center">
        <h1 className="text-4xl text-center text-bold my-5">Вхід</h1>

        <div class="px-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">
          <button
            onClick={loginWithGoogle}
            className="bg-white rounded p-1 px-3 block mx-auto m-3"
          >
           <FontAwesomeIcon className="mr-2" icon={faGoogle}/> Вхід через Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

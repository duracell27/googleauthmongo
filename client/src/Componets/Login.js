import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const loginWithGoogle = () => {
    window.open("http://localhost:5050/auth/google/callback", "_self");
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div class="bg-green-500">
        <h1 className="text-4xl text-center">Login</h1>

        <div class="">
          <button
            onClick={loginWithGoogle}
            className="bg-white rounded p-1 block mx-auto mb-3"
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { authWithGoogle } from "../utils/firebase";
import axios from "axios";
import { AuthContext } from "../App";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const { userdata, setUserdata } = useContext(AuthContext);

  const navigane = useNavigate();

  //логін через гугл, заповняємо дані користувача
  const handleGoogleAuth = (e) => {
    e.preventDefault();
    // функція від фаєрбейс
    authWithGoogle()
      .then(async (user) => {
        try {
          const response = await axios.post(
            process.env.REACT_APP_BACK_URL + "/google-auth",
            { access_token: user.accessToken }
          );
          if (response.status === 200) {
            sessionStorage.setItem("user", JSON.stringify(response.data));
            setUserdata(response.data);
            navigane("/profile/friends");
          }
        } catch (error) {
          toast.error(error.response.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="bg-green-500 h-screen">
      <div className="flex flex-col gap-1 justify-evenly items-center">
        <h1 className="text-4xl text-white text-center font-bold my-5">Вхід</h1>

        <div className="px-2 shadow-lg shadow-black/30 text-lg font-bold bg-green-600 text-center rounded-lg">
          <button
           
            onClick={handleGoogleAuth}
            className="bg-slate-800 rounded p-1 px-3 block mx-auto m-3 text-white"
          >
            <FontAwesomeIcon className="mr-2 text-white" icon={faGoogle} /> Вхід через
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

import "../styles/Login.css";
import { useState } from "react";
import Navigation from "./Navigation";
import { useNavigate } from "react-router-dom";
const axios = require("axios");

export const Login = () => {
  const [username, updateUsername] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  const checkLogin = () => {
    axios
      .post(
        `http://localhost:8080/users/setLogin`,
        { username: username, password: password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then()
      .catch((err) => {
        alert("Invalid Credentials");
        return;
      });
      
    navigate("/notifier");
    window.location.reload(false);
  };

  return (
    <div>
      <Navigation />
      <div className="login-form">
        <form>
          <div className="username-form">
            <label htmlFor="loginUsername">Username</label>
            <br />
            <input
              id="loginUsername"
              onChange={(e) => updateUsername(e.target.value)}
            ></input>
          </div>
          <div className="password-form">
            <label htmlFor="loginPassword">Password</label>
            <br />
            <input
              type="password"
              id="loginPassword"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={checkLogin}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

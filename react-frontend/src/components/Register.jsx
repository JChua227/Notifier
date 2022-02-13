import "../styles/Login.css";
import { useState } from "react";
import Navigation from "./Navigation";
import { useNavigate } from 'react-router-dom';

export const Register = () => {
  const [password, setPassword] = useState({
    firstPassword: "",
    confirmPassword: "",
    samePasswords: "false",
  });

  const [username, setUsername] = useState("");
  let navigate = useNavigate();

  const callPassword = (e) => {
    updatePassword(e);
    updateConfirmPassword();
  };

  const callConfirmPassword = (e) => {
    updateSamePassword(e);
    updateConfirmPassword();
  };

  const updatePassword = (e) => {
    setPassword((password) => ({ ...password, firstPassword: e.target.value }));
  };

  const updateSamePassword = (e) => {
    setPassword((password) => ({
      ...password,
      confirmPassword: e.target.value,
    }));
  };

  const updateConfirmPassword = () => {
    setPassword((password) => ({
      ...password,
      samePasswords:
        password.firstPassword === password.confirmPassword &&
        password.firstPassword !== "",
    }));
  };

  const createAccount = () => {
    fetch("http://localhost:8080/users/create", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password.firstPassword,
      }),
    }).catch((err) => {
      alert("Invalid Fields");
      return;
    });

    return navigate('/login')
    //unique usernames only...deny when one already exists
  };

  return (
    <div>
      <Navigation />
      <div className="register-form">
        <form>
          <div className="username-form">
            <label htmlFor="registerUsername">Username</label>
            <br />
            <input
              id="registerUsername"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            ></input>
          </div>
          <div className="password-form">
            <label htmlFor="registerPassword">Password</label>
            <br />
            <input
              type="password"
              id="registerPassword"
              onChange={callPassword}
            ></input>
            {!password.samePasswords && (
              <p className="password-error">both passwords must be the same</p>
            )}
          </div>
          <div className="confirm-password-form">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <br />
            <input
              type="password"
              id="confirmPassword"
              onChange={callConfirmPassword}
            ></input>
            {!password.samePasswords && (
              <p className="password-error">both passwords must be the same</p>
            )}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={createAccount}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;

import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "@auth0/auth0-react";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/home.css";

const Home = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const saveToDatabase = (type) => {
    console.log(db);
  };

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    <div className="home">
      <img src={logo} className="logo" />
      {!isAuthenticated && (
        <>
          <h3>To create a session:</h3>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => loginWithRedirect()}
          >
            Sign in with account
          </Button>
        </>
      )}
      {isAuthenticated && (
        <>
          <h3>Select your status:</h3>
          <div style={{ padding: 10 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => saveToDatabase("teacher")}
              style={{ margin: 10 }}
            >
              Teacher
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => saveToDatabase("student")}
              style={{ margin: 10 }}
            >
              Student
            </Button>
          </div>
          <Link to="/class/109074203591919453634">Class</Link>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => logoutWithRedirect()}
          >
            Sign out
          </Button>
        </>
      )}
    </div>
  );
};

export default Home;

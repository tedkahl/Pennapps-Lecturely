import React from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "@auth0/auth0-react";
import logo from "../assets/logo.png";
import "../styles/home.css";

const Home = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  if (isAuthenticated) {
    //save use to firebase
  }

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

  return (
    <div className="home">
      <img src={logo} className="logo" />
      <h3>To create a session:</h3>
      {!isAuthenticated && (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => loginWithRedirect()}
        >
          Sign in with account
        </Button>
      )}
      {isAuthenticated && (
        <>
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

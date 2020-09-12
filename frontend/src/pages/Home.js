import React from "react";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "@auth0/auth0-react";

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
    <div>
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

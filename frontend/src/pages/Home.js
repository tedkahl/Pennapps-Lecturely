import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { useAuth0 } from "@auth0/auth0-react";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/home.css";

const Home = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  let [saved, setSaved] = useState(false);

  // useEffect(() => {
  //   async function fetchData() {
  //     if (isAuthenticated) {
  //       const response = await getUser(user.sub);
  //       if (response) setSaved(true);
  //     }
  //   }
  //   fetchData();
  // }, []); // Or [] if effect doesn't need props or state

  const saveToDatabase = (isTeacher) => {
    db.collection("user")
      .doc(user.sub)
      .set({
        id: user.sub,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        profile: user.picture,
        isteacher: isTeacher,
        sessionid: "",
        group: "",
      })
      .then(function () {
        console.log("Document successfully written!");
      })
      .catch(function (error) {
        console.error("Error writing document: ", error);
      });
  };

  const getUser = async (id) => {
    const doc = await db.doc(`user/${id}`).get();
    const user = doc.data();
    return user;
  };

  const connectToDatabase = async (isTeacher) => {
    const response = await getUser(user.sub);
    console.log(response);
    if (!response) {
      await saveToDatabase(isTeacher);
      console.log("added to database with id", user.sub);
    } else {
      console.log("user already exists");
    }
    setSaved(true);
  };

  const checkForOldUser = async () => {
    const response = await getUser(user.sub);
    console.log(response);
    console.log(saved);
    if (response && !saved) setSaved(true);
  };

  if (isAuthenticated && !saved) {
    checkForOldUser();
  }

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
          {!saved && (
            <>
              <h3>Select your status:</h3>
              <div style={{ padding: 10 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => connectToDatabase(true)}
                  style={{ margin: 10 }}
                >
                  Teacher
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => connectToDatabase(false)}
                  style={{ margin: 10 }}
                >
                  Student
                </Button>
              </div>
            </>
          )}

          <Link to={`/class/${user.sub.split("|")[1]}`}>
            Your Personal Class
          </Link>
          <Link to={`/board/${user.sub.split("|")[1]}`}>
            Your Personal Board
          </Link>
          <Link to={`/class/109074203591919453634`}>Test Class</Link>
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

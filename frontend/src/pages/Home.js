import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
//import { useAuth0 } from "@auth0/auth0-react";
import { db } from "../firebase";
import logo from "../assets/logo.png";
import "../styles/home.css";

const Home = () => {
  let isAuthenticated = false;

  const loginWithRedirect = () => {
    isAuthenticated = true;
  };
  //  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  let [saved, setSaved] = useState(false);
  let [classCode, setClassCode] = useState("");
  let [id, setID] = useState("");
  let [session, setSession] = useState("");
  /*const saveToDatabase = (isTeacher) => {
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
  };*/

  /*const getUser = async (id) => {
    const doc = await db.doc(`user/${id}`).get();
    const user = doc.data();
    return user;
  };*/
  /*
  const connectToDatabase = async (isTeacher) => {
    setIsTeacher(isTeacher);
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
    if (response && !saved) {
      setSaved(true);
      setIsTeacher(response.isteacher);
    }
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setClassCode(newValue);
  };
  
  if (isAuthenticated && !saved) {
    checkForOldUser();
  }

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });
*/
  return (
    <div className="home">
      <img src="../assets/logo.png"></img>
      <p>Choose ID</p>
      <input type="text" onClick={(e) => setID(e.target.value)}></input>
      <p>Choose Session (equal to ID for teachers)</p>
      <input type="text" onClick={(e) => setSession(e.target.value)}></input>
      <Link to={`/Class/${session}/${id}`}>
        <Button>Enter Class</Button>
      </Link>
    </div>
  );
};

export default Home;

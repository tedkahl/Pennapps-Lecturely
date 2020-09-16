import React, { useState, useEffect } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Board from "./Board_Less";
import { db } from "../firebase";

const Class = (props) => {
  const [usersList, setUsersList] = useState([]);
  const id = props.match.params.id;
  const sessionid = props.match.params.sessionid;
  const isteacher = sessionid === id;
  // compare this session ID to user token to see if teacher

  props.socket.on("update users", (data) => {
    console.log("update users: ", data);
    console.log(usersList);
    if (data && data.users != usersList) {
      setUsersList(data.users);
    }
  });

  const studentList = (
    <List style={{ margin: "0 auto 0 auto" }}>
      {usersList && isteacher ? (
        usersList.map((id) => {
          return (
            <ListItem>
              <Board
                id={id}
                sessionid={sessionid}
                styling="main"
                socket={props.socket}
              />
            </ListItem>
          );
        })
      ) : (
        <ListItem>
          <Board
            id={id}
            sessionid={sessionid}
            styling="main"
            socket={props.socket}
          />
        </ListItem>
      )}
    </List>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div>
        {isteacher && <h3 style={{ textAlign: "center" }}>{props.id}</h3>}
        <Board
          id={id}
          sessionid={sessionid}
          styling={"main"}
          socket={props.socket}
        />
      </div>
      {studentList}
    </div>
  );
};

export default Class;

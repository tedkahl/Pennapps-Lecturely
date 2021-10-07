import React, { useState, useEffect } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Board from "./Board";
import { db } from "../firebase";

const Class = (props) => {
  const [usersList, setUsersList] = useState([]);

  // compare this session ID to user token to see if teacher
  const isteacher = props.sessionid === props.id;

  props.socket.on("update users", (data) => {
    if (data) {
      console.log(data.users);
      setUsersList(data.users);
      console.log("user list set", usersList);
    }
  });

  let userBoards;
  if (usersList && usersList[0]) {
    console.log(usersList);
    userBoards = isteacher ? (
      <GridList
        container="true"
        cols={2}
        overflow="auto"
        spacing={5}
        cellHeight={260}
      >
        {usersList.map((user) => {
          return (
            <GridListTile key={user.id} cols={1}>
              <Board
                id={user.id}
                name={user.name}
                sessionid={props.sessionid}
                styling="side"
                socket={props.socket}
                noDraw={true}
              />
            </GridListTile>
          );
        })}
      </GridList>
    ) : (
      <Board
        id={props.sessionid}
        name={usersList[0].name}
        sessionid={props.sessionid}
        styling="main"
        socket={props.socket}
        noDraw={true}
      />
    );
  }
  return (
    <Grid container direction="row" justify="space-evenly">
      <Grid item xs={6}>
        {isteacher && <h3 style={{ textAlign: "center" }}>{props.id}</h3>}
        <Board
          id={props.id}
          name={props.name}
          sessionid={props.sessionid}
          styling={"main"}
          socket={props.socket}
        />
      </Grid>
      <Grid item xs={5}>
        {userBoards}
      </Grid>
    </Grid>
  );
};

export default Class;

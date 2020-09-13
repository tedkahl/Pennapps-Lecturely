import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import io from "socket.io-client";
import Board from "./Board";

const ENDPOINT = "http://localhost:4000";

const activeUsers = ["109074203591919453634", "104609449234380862807"];

const Class = (props) => {
  const { user } = useAuth0();
  let socket;
  const userID = user.sub.split("|")[1];
  // compare this session ID to user token to see if teacher
  if (props.match.params.id === userID)
    socket = io.connect(ENDPOINT + "/admin");
  else socket = io.connect(ENDPOINT + "/student", { query: `id=${userID}` });

  const boards = activeUsers.map((id) => (
    <Board
      id={id}
      styling={props.match.params.id === id ? "main" : "side"}
      socket={socket}
    />
  ));

  const studentList = (
    <List>
      {activeUsers.map((id) => (
        <ListItem>
          <Board id={id} styling={"side"} socket={socket} noColor={true} />
        </ListItem>
      ))}
    </List>
  );

  return studentList;
  //return <ul>{boards}</ul>;
};

export default Class;

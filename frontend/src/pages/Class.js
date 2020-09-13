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
  const mysocket = io.connect(ENDPOINT, {
    query: {
      boardid: props.id,
      sessionid: props.match.params.id,
      isteacher: props.match.params.id === props.id,
    },
  });

  let boards;

  if (props.match.params.id === userID) {
    mysocket.emit("get active users", { sessionid: props.match.params.id });
    mysocket.on("active users", (users) => {
      boards = users.map((id) => (
        <Board
          id={id}
          sessionid={props.match.params.id}
          styling="side"
          socket={socket}
        />
      ));
    });
  }

  const studentList = (
    <List>
      {activeUsers.map((id) => (
        <ListItem>
          <Board id={id} styling={"side"} socket={socket} noColor={true} />
        </ListItem>
      ))}
    </List>
  );

  //sort all students into groups of size groupsize
  const enableGroups = (groupsize) => {
    const myboard = boards.find((board) => {
      return board.props.id === userID;
    });

    mysocket.emit("enable groups", {
      sessionid: myboard.props.sessionid,
      isteacher: myboard.props.sessionid === userID,
      groupsize: groupsize,
    });
  };

  //move studentid to group groupnum
  const moveStudent = (studentid, groupnum) => {
    const myboard = boards.find((board) => {
      return board.props.id === userID;
    });

    const studentsocket = boards.find((board) => {
      return board.props.id === studentid;
    }).props.socket;

    mysocket.emit("move student", {
      sessionid: myboard.props.sessionid,
      isteacher: myboard.props.sessionid === userID,
      studentid: studentsocket.id,
      groupnum: groupnum,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Board id={"123"} styling={"main"} socket={socket} />
      {studentList}
    </div>
  );
  //return <ul>{boards}</ul>;
};
export default Class;

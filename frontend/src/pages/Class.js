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
  const [loaded, setLoaded] = useState(0);

  const { user } = useAuth0();

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
  mysocket.on("active users", (users) => {
    boards = users.map((user) => (
      <Board
        id={user.userID}
        sessionid={props.match.params.id}
        styling="side"
        socket={user.socket}
      />
    ));
    setLoaded(true);
  });

  mysocket.emit("get active users", {
    isteacher: props.match.params.id === userID,
    sessionid: props.match.params.id,
  });

  const studentList = loaded ? (
    <List style={{ margin: "0 auto 0 auto" }}>
      {boards.map((board) => (
        <ListItem>{board}</ListItem>
      ))}
    </List>
  ) : null;

  const enableGroups = (groupsize) => {
    mysocket.emit("enable groups", {
      sessionid: props.match.params.id,
      isteacher: props.match.params.id === userID,
      groupsize: groupsize,
    });
  };

  //move studentid to group groupnum
  const moveStudent = (studentid, groupnum) => {
    const studentsocket = boards.find((board) => {
      return board.props.id === studentid;
    }).props.socket;

    mysocket.emit("move student", {
      boardid: userID,
      sessionid: props.match.params.id,
      isteacher: props.match.params.id === userID,
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
      <Board id={userID} styling={"main"} socket={mysocket} />
      {studentList}
    </div>
  );
  //return <ul>{boards}</ul>;
};
export default Class;

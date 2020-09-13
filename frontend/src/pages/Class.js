import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
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
  io.connect(ENDPOINT);

  const boards = activeUsers.map((id) => (
    <Board id={id} sessionid={props.match.params.id} socket={socket} />
  ));

  //sort all students into groups of size groupsize
  const enableGroups = (groupsize) => {
    const myboard = boards.find((board) => {
      return board.props.id === userID;
    });
    const mysocket = myboard.props.socket;

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
    const mysocket = myboard.props.socket;

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
  return <ul>{boards}</ul>;
};

export default Class;

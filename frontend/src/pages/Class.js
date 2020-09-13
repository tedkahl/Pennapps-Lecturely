import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Grid from "@material-ui/core/Grid";
import io from "socket.io-client";
import Board from "./Board";
import { db } from "../firebase";

const ENDPOINT = "http://localhost:4000";

const activeUsers = ["109074203591919453634", "104609449234380862807"];

const Class = (props) => {
  const { user } = useAuth0();

  const userID = user.sub.split("|")[1];

  // compare this session ID to user token to see if teacher
  let mysocket = io.connect(ENDPOINT, {
    query: {
      boardid: userID,
      sessionid: props.match.params.id,
    },
  });

  let studentList = <List style={{ margin: "0 auto 0 auto" }}></List>;
  let boards = [];

  //let query = await getactiveusers(userID, props.match.paramd.id);
  db.collection("activeusers")
    .where("sessionid", "==", props.match.params.id)
    .get()
    .then((query) => {
      console.log(query);
      let activeUsers = query.map((querySnapshot) => {
        querySnapshot.map((item) => {
          return item.doc;
        });
      });

      boards = activeUsers.map((user) => (
        <Board
          id={user.userID}
          sessionid={props.match.params.id}
          styling="side"
          socket={user.socket}
        />
      ));

      studentList = (
        <List style={{ margin: "0 auto 0 auto" }}>
          {boards.map((board) => (
            <ListItem>{board}</ListItem>
          ))}
        </List>
      );

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
        </div>
      );
      //return <ul>{boards}</ul>;
    });
};

export default Class;

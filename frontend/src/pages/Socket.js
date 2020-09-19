import React from "react";
import Class from "./Class_Less";
import io from "socket.io-client";
//import { useAuth0 } from "@auth0/auth0-react";

const ENDPOINT = "http://localhost:4000";

const Socket = (props) => {
  //const { user } = useAuth0();
  //const id = user.sub.split("|")[1];
  const socket = io.connect(ENDPOINT, {
    query: {
      id: props.match.params.id,
      sessionid: props.match.params.sessionid,
      userconnection: true,
    },
  });
  return (
    <Class
      {...props}
      id={props.match.params.id}
      sessionid={props.match.params.sessionid}
      socket={socket}
    />
  );
};

export default Socket;

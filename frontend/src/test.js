import React from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:4000";
const socket = socketIOClient(ENDPOINT);

export default class Test extends React.Component {
  state = {
    userid: 0,
    sessionid: "",
    isteacher: false,
  };

  emitdrawdata = () => {
    let data = {
      userid: this.state.userid,
      sessionid: this.state.sessionid,
      isteacher: this.state.isteacher,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
    };
    console.log(data);
    socket.emit("drawing", data);
  };

  componentDidMount() {
    let connection = socket.connect();
    connection.on("connect", () => {
      this.setState({ userid: connection.id });
      console.log(this.state.userid);
    });
    socket.on("drawing", (data) => {
      console.log(data.userid);
      console.log(data.sessionid);
      console.log(data.isteacher);
      console.log(data.x0);
      console.log(data.y0);
      console.log(data.x1);
      console.log(data.x1);
    });
  }

  join = (e) => {
    console.log(this.state);
    if (this.state.userid && this.state.sessionid) {
      socket.emit("join request", this.state);
    }
  };

  changesession = (e) => {
    this.setState({ sessionid: e.target.value });
    console.log(this.state.sessionid);
  };

  changeteacher = (e) => {
    if (e.target.value == "true") this.setState({ isteacher: true });
    else if (e.target.value == "false") this.setState({ isteacher: false });
    console.log(this.state.isteacher);
  };

  groups = () => {
    let data = {
      userid: this.state.userid,
      sessionid: this.state.sessionid,
      isteacher: this.state.isteacher,
      groupsize: 2,
    };
    socket.emit("enable groups", data);
  };

  render() {
    return (
      <div>
        <form>
          <label>session</label>
          <input type="text" onChange={this.changesession}></input>
          <label>isteacher</label>
          <input type="text" onChange={this.changeteacher}></input>
        </form>
        <button onClick={this.join}>join</button>
        <button onClick={this.emitdrawdata}>draw</button>
        <button onClick={this.groups}>Put students into groups of 2</button>
      </div>
    );
  }
}

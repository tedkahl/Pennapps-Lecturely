const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 4000;
//const max_teacherid = 1000; //if user id is below 1000, user is a teacher

//does nothing really
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("drawing", (data) => {
    socket.broadcast.emit("drawing", data);
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

/*new users submit a join request with session id. Join a room for that session id, distinguished
by teacher or student*/
//data format {sessionid:string isteacher:x}
io.on("connection", (socket) => {
  socket.on("join request", (data) => {
    saveUser(data);

    let room = data.sessionid;
    if (data.isteacher) {
      socket.join(room + "-teacher");
    } else {
      socket.join(room);
      socket.to(data.sessionid + "-teacher").emit("join request", data); //tells the teacher who the student is
    }

    console.log(socket.id, " joined ", data.sessionid);
  });
});

/*Send teacher draw data to students and student data to teachers. Draw data includes
sessionid and userid in addition to draw information*/
//{sessionid isteacher x0 y0 x1 y1}
//database call here seems bad
io.on("connection", (socket) => {
  socket.on("draw data", (data) => {
    room = findGroupRoom(socket) || data.sessionid;

    console.log(room);

    if (data.isteacher) {
      io.to(data.sessionid).emit("draw data", data); //if user is teacher, send data to session
    } else {
      io.to(data.sessionid + "-teacher").emit("draw data", data); //if user is student, send data to teacher of session
      if (room != data.sessionid) {
        io.to(room).emit("draw data", data); //if student is in a group, send data to group
      }
    }
  });
});

// data format {userid:x sessionid:string groupsize:x}
io.on("connection", (socket) => {
  socket.on("enable groups", (data) => {
    if (!data.isteacher) return;

    let students = Object.keys(
      io.sockets.adapter.rooms[data.sessionid].sockets
    );
    let groupnum;
    //if groupsize=3, and sessionid=55, put students 0, 1 and 2 into group 55-0, 3,4,5 into group 55-1, etc
    if (data.groupsize > 1 && data.groupsize <= students.length) {
      students.forEach((studentid, index) => {
        groupnum = Math.floor(index / data.groupsize);
        let room = data.sessionid + "-" + groupnum;
        io.sockets.connected[studentid].join(room);
        console.log(studentid, " joined ", room);

        /*db.collection("users")
          .doc("" + student.id)
          .update({ group: groupnum });*/
      });
    }
  });
});

//data format {sessionid studentid groupnum}
//change a student's group
io.on("connection", (socket) => {
  socket.on("move student", (data) => {
    if (!data.isteacher) return;
    let student = io.sockets.connected[data.studentid];

    student.leave(findGroupRoom(data.studentid));
    let room = data.sessionid + "-" + data.groupnum;
    student.join(room);
    console.log(data.studentid, " joined ", room);
    //db.collection("users").doc(data.studentid).update({ group: groupnum });
  });
});

function findGroupRoom(studentid) {
  let rooms = Object.keys(io.sockets.manager.roomClients[studentid]);
  console.log(rooms);
  return rooms.find((room) => {
    return /\d-\d/.test(room);
  });
}

app.get("/", (req, res) => {
  res.send("server running");
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

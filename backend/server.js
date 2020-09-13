const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 4000;
//const max_teacherid = 1000; //if user id is below 1000, user is a teacher

//does nothing really
io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("a user disconnected");
  });
});

/*new users submit a join request with session id. Join a room for that session id, distinguished
by teacher or student*/
//data format {sessionid:string isteacher:x}
io.on("connection", (socket) => {
  socket.on("join request", (data) => {
    let room = data.isteacher ? data.sessionid + "-teacher" : data.sessionid;

    socket.join(room);
    if (!data.isteacher)
      socket.to(data.sessionid + "-teacher").emit("join request", data); //tells the teacher who the student is

    console.log(socket.id, " joined ", room);
  });
});

/*Send teacher drawing to students and student data to teachers. drawing includes
sessionid and userid in addition to draw information*/
//{sessionid isteacher x0 y0 x1 y1}
//database call here seems bad
io.on("connection", (socket) => {
  socket.on("drawing", (data) => {
    room = findGroupRoom(socket.id) || data.sessionid;

    console.log(room);

    if (data.isteacher) {
      console.log("emitting to session");
      io.to(data.sessionid).emit("drawing", data); //if user is teacher, send data to session
    } else {
      console.log("emitting to teacher");
      io.to(data.sessionid + "-teacher").emit("drawing", data); //if user is student, send data to teacher of session
      if (room != data.sessionid) {
        console.log("emitting to group");
        io.to(room).emit("drawing", data); //if student is in a group, send data to group
      }
    }
  });
});

// data format {sessionid:string groupsize:x}
io.on("connection", (socket) => {
  socket.on("enable groups", (data) => {
    if (!data.isteacher) return;

    let students = Object.keys(
      io.sockets.adapter.rooms[data.sessionid].sockets
    );

    let groupnum;
    let room;
    //if groupsize=3, and sessionid=55, put students 0, 1 and 2 into group 55-0, 3,4,5 into group 55-1, etc
    if (data.groupsize > 1 && data.groupsize <= students.length) {
      students.forEach((studentid, index) => {
        groupnum = Math.floor(index / data.groupsize);
        room = data.sessionid + "-" + groupnum;

        io.sockets.connected[studentid].join(room);

        console.log(studentid, " joined ", room);
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
  let rooms = Object.keys(io.sockets.connected[studentid].rooms);
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

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/*const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();
*/
const port = process.env.PORT || 4000;
//const max_teacherid = 1000; //if user id is below 1000, user is a teacher

let studentsList = {};
let teachers = {};

/*function updateLoop() {
  if (
    JSON.stringify(studentsList) !== JSON.stringify(lastStudentsList) ||
    JSON.stringify(teachers) !== JSON.stringify(lastteachers)
  ) {
    console.log("updating users");
    console.log("students:", Object.values(studentsList));
    console.log("teachers:", Object.values(teachers));
    console.log("sockets:", Object.keys(io.sockets.connected));
  }
  lastStudentsList = studentsList;
  lastteachers = teachers;
  setTimeout(() => updateLoop(), 2000);
}*/

//send student data to teacher
function updateUsers(sessionid) {
  let students = studentsList[sessionid]
    ? Object.values(studentsList[sessionid])
    : [];
  let teacher = [teachers[sessionid]];
  if (teacher.length > 0) {
    console.log("students", students);
    emitToTeacher(sessionid, "update users", { users: students });
  }
  console.log("teacher", teacher);
  io.to(sessionid).emit("update users", { users: teacher });
}

//keep track of students who connect
io.on("connection", async (socket) => {
  //console.log("a user connected");
  let query = socket.handshake.query;

  //join room here
  let room =
    query.id === query.sessionid
      ? query.sessionid + "-teacher"
      : query.sessionid;
  socket.join(room);
  console.log(query.id, " joined ", room);

  //if this is a user connecting and not just a board, record them. When they log off later,
  //delete
  if (query.userconnection) {
    if (!studentsList[query.sessionid]) studentsList[query.sessionid] = {};

    if (query.id === query.sessionid) teachers[query.sessionid] = query.id;
    else studentsList[query.sessionid][query.id] = query.id;

    updateUsers(query.sessionid);

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      if (query.id === query.sessionid) delete teachers[query.sessionid];
      else delete studentsList[query.sessionid][query.id];
      updateUsers(query.sessionid);
    });
  }
});

function emitToTeacher(sessionid, eventname, data) {
  io.to(sessionid + "-teacher").emit(eventname, data);
}

/*Send teacher drawing to students and student data to teachers. drawing includes
sessionid and userid in addition to draw information*/
//{sessionid isteacher x0 y0 x1 y1}
//database call here seems bad
io.on("connection", (socket) => {
  socket.on("drawing", (data) => {
    console.log(data.color);
    grouproom = findGroupRoom(socket.id);

    if (data.id === data.sessionid) {
      io.to(data.sessionid).emit("drawing", data); //if user is teacher, send data to session
    } else {
      emitToTeacher(data.sessionid, "drawing", data);

      if (grouproom) {
        data.isgroupdata = true;
        io.to(grouproom).emit("drawing", data); //if student is in a group, send data to group
      }
    }
  });
});

// data format {sessionid:string groupsize:x}
io.on("connection", (socket) => {
  socket.on("enable groups", (data) => {
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
  return rooms.find((room) => {
    return /\d+-\d+/.test(room);
  });
}

app.get("/", (req, res) => {
  res.send("server running");
});

app.get("/process-text", async (req, res) => {
  try {
    const [result] = await client.documentTextDetection("./sample.png");
    const fullTextAnnotation = result.fullTextAnnotation;
    console.log(`Full text: ${fullTextAnnotation.text}`);
  } catch (e) {
    console.log("Error: " + e);
  }
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

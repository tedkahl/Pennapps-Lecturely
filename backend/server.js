const { db } = require("../frontend/src/firebase");

const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();

const port = process.env.PORT || 4000;
//const max_teacherid = 1000; //if user id is below 1000, user is a teacher

let studentsList = {};
let teachersList = {};

async function saveactiveuser(userid,sessionid, socket){
  await db.collection("activeusers").doc(userid).set({userid:userid, sessionid:sessionid, socket:socket})
}

async function deleteactiveuser(userid, sessionid){
  await db.collection("activeusers").doc(userid).delete()
}

//keep track of students who connect
io.on("connection", async (socket) => {
  console.log("a user connected");
  let query = socket.handshake.query;

  console.log(socket.id);
  console.log(query);
  let sessionid = query.sessionid;

  if (sessionid) {
    await saveactiveuser({userid:query.userid,sessionid:query.sessionid,socket:socket});
     
    /*if (query.boardid == sessionid) {
      
      if (!studentsList[sessionid]) studentsList[sessionid] = [];

      studentsList[sessionid].push({
        socketID: socket.id,
        userID: query["id"],
      });

      socket.on("disconnect", () => {
        studentsList[sessionid].splice(
          studentsList[sessionid].findIndex((item, index) => {
            console.log(index);
            item.socketID === socket.id;
          }),
          1
        );
      });
    } else {
      teachersList[sessionid] = [{ socketID: socket.id, userID: query["id"] }];

      socket.on("disconnect", () => {
        teachersList[sessionid] = [];
      });
    }*/
    //join room here
    let room = query.boardid == sessionid ? sessionid + "-teacher" : sessionid;
    socket.join(room);
    console.log(socket.id, " joined ", room);

    socket.on("disconnect", () => {
      await deleteactiveuser(query.userid, query.sessionid);
    });
  }
});

//get active users for a specific session
/*
io.on("connection", (socket) => {
  console.log("getting users");
  socket.on("get active users", (data) => {
    let users = [];
    if (
      data.isteacher &&
      teachersList[data.sessionid] &&
      teachersList[data.sessionid].length > 0
    ) {
      users = teachersList[data.sessionid];
      users[0].socket = users[0].socketID;
    } else if (studentsList[data.sessionid])
      users = studentsList[data.sessionid].map((student) => {
        student.socket = student.socketID;
        return student;
      });
    socket.emit("active users", users); //this should be just to the socket that asked?
  });
});*/

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

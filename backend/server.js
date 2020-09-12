const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
//const firebase = require("firebase");
//const { option } = require("yargs");
//require("firebase/firestore");
//firebase.initializeApp(firebaseConfig);

//var db = firebase.firestore();

const port = process.env.PORT || 4000;
//const max_teacherid = 1000; //if user id is below 1000, user is a teacher

/*
user
{
userid:equal to socket id,
name:x,
sessionid:string,
isteacher:bool,
group:x
}

*/

//change this if there's a better way to do it
function isTeacher(userid) {
  return db
    .collection("users")
    .where("userid", "==", userid)
    .where("isteacher", "==", true)
    .get()
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

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

//add new user to database
function saveUser(data) {
  let newuser = {
    userid: data.userid,
    name: data.name,
    sessionid: data.sessionid,
    isteacher: data.isteacher,
  };
  db.collection("users")
    .doc(data.userid)
    .set(newuser)
    .then(function () {
      console.log("Document successfully written!");
    })
    .catch(function (error) {
      console.error("Error writing document: ", error);
    });
}

/*new users submit a join request with session id. Join a room for that session id, distinguished
by teacher or student*/
//data format {userid:x name:x sessionid:string isteacher:x}
io.on("connection", (socket) => {
  socket.on("join request", (data) => {
    saveUser(data);

    if (isTeacher(data.userid)) {
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

//database call here seems bad
io.on("connection", (socket) => {
  socket.on("draw data", (data) => {
    room = findGroupRoom(socket) || data.sessionid;

    console.log(room);

    if (data.isteacher) {
      io.to(sessionid).emit("draw data", data); //if user is teacher, send data to session
    } else {
      io.to(sessionid + "-teacher").emit("draw data", data); //if user is student, send data to teacher of session
      if (room != data.sessionid) {
        io.to(room).emit("draw data", data); //if student is in a group, send data to group
      }
    }
  });
});

// data format {userid:x sessionid:string groupsize:x}
io.on("connection", (socket) => {
  socket.on("enable groups", (data) => {
    if (!isTeacher(data.userid)) return;

    let students = io.sockets.clients(data.sessionid);
    let groupnum;
    //if groupsize=3, and sessionid=55, put students 0, 1 and 2 into group 55-0, 3,4,5 into group 55-1, etc
    if (data.groupsize > 1 && groupsize <= students.length) {
      students.forEach((student, index) => {
        groupnum = Math.floor(index / groupsize);
        student.join(data.sessionid + "-" + groupnum);
        db.collection("users")
          .doc("" + student.id)
          .update({ group: groupnum });
      });
    }
  });
});

//data format {userid, sessionid studentid groupnum}
//change a student's group
io.on("connection", (socket) => {
  socket.on("move student", (data) => {
    if (!isTeacher(data.userid)) return;
    let student = io.sockets.clients(data.sessionid).find((student) => {
      return student.id == data.studentid;
    });
    student.leave(findGroupRoom(student));
    student.join(data.sessionid + "-" + data.groupnum);

    db.collection("users").doc(data.studentid).update({ group: groupnum });
  });
});

function findGroupRoom(socket) {
  socket.room.find((room) => {
    return /.+-.+/.test(room);
  });
}

app.get("/", (req, res) => {
  res.send("server running");
});

http.listen(port, () => {
  console.log(`listening on ${port}`);
});

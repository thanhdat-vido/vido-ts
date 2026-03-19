var express = require("express");
var cors = require('cors');
var mongoose = require('mongoose');
const Message = require("./models/message");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const multer = require("multer");

var app = express();
var http = require('http');
const path = require("path");
var upload = multer();

var socketIO = require("socket.io");

var port = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.json({
    limit: '50mb',
    parameterLimit: 50000,
    extended: true
}));
app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));
app.use(express.static('js'));
app.set('view engine', 'ejs');
app.use(upload.array());

app.use((req, res, next) => {

  // 🎯 redirect lucky wheel
  if (/lucky-wheel|lucky_wheel\.html/.test(req.path)) {
    return res.redirect(301, "https://vong-quay-eta.vercel.app/");
  }

  // 📚 redirect library
  if (/^\/library/.test(req.path)) {
    return res.redirect(301, "https://thuvien-three.vercel.app/");
  }

  next();
});

mongoose.connect("mongodb+srv://administrator:admin123456@cluster.jh4lmtx.mongodb.net/").then(() => {
    console.log("Connected to mongodb");
}).catch((err) => {
    console.log("Error connecting to mongodb: ", err);
})

app.use('/api/notification', require('./routes/api/notification'));
app.use('/api/chat', require('./routes/api/chat'));
app.use('/api/mobile', require('./routes/api/otp'));
app.use('/api/mail', require("./routes/api/mail"));
app.use('/api/crm', require("./routes/api/crm"));
app.use('/api/google', require("./routes/api/google"));
app.use('/api/student', require("./routes/api/student"));
app.use('/api/class', require("./routes/api/class"));
app.use('/api/career', require("./routes/api/career"));
app.use('/api/zalo', require("./routes/api/zalo"));
app.use('/api/subject', require("./routes/api/subject"));
app.use('/api/website', require("./routes/api/website"));
app.use('/api/book', require("./routes/api/book"));
app.use('/api/diploma', require("./routes/api/diploma"));
app.use('/api/check', require("./routes/api/check"));
app.use('/api/medical', require("./routes/api/medical"));
app.use('/api/crawler', require("./routes/api/crawler"));
app.use('/api/school', require("./routes/api/school"));
app.use('/api/attendance', require("./routes/api/attendance"));

app.get('/delete-account', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/index.html'));
});
app.get('/lucky-wheel', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/lucky/lucky_wheel.html'));
});
app.get('/exam', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/exam/exam.html'));
});
app.get('/template', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/contact/contact.html'));
});
app.get('/orientation', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/career/career.html'));
});
app.get('/orientation', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/management/index.html'));
});
app.get('/library', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/library/library.html'));
});
app.get('/library/detail', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/library/detail.html'));
});
app.get('/landing-page', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/landing-page/index.html'));
});
app.get('/landing-page-cd18', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/landing-page-cd18/index.html'));
});
app.get('/medical', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/index.html'));
});
app.get('/medical/mng/ad', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/admin.html'));
});
app.get('/medical/mng/ad/blog', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/blog-manager.html'));
});
app.get('/medical/mng/ad/blog/detail', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/blog-detail.html'));
});
app.get('/medical/mng/ad/category', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/category-manager.html'));
});
app.get('/medical/mng/ad/form', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/admin-form.html'));
});
app.get('/medical/patient/form', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/patient-form.html'));
});
app.get('/medical/patient/search', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/search.html'));
});
app.get('/medical/blog', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/medical/blog.html'));
});
app.get('/shs-ges', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/admission-result/graduation.html'));
});
app.get('/jhs-ges', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/admission-result/highschool.html'));
});
app.get('/school', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/school/index.html'));
});
app.get('/school/notify', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/school/notify.html'));
});
app.get('/school/survey', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/school/survey.html'));
});
app.get('/school/scanned', function (req, res) {
    res.sendFile(path.join(__dirname + '/pages/school/scanned.html'));
});

app.use(express.static(__dirname + '/pages'));
app.use(express.static(__dirname + '/pages/lucky'));
app.use(express.static(__dirname + '/pages/landing-page'));
app.use(express.static(__dirname + '/pages/landing-page-cd18'));
app.use(express.static(__dirname + '/pages/exam'));
app.use(express.static(__dirname + '/pages/contact'));
app.use(express.static(__dirname + '/pages/career'));
app.use(express.static(__dirname + '/pages/management'));
app.use(express.static(__dirname + '/pages/library'));
app.use(express.static(__dirname + '/pages/medical'));
app.use(express.static(__dirname + '/pages/admission-result'));
app.use(express.static(__dirname + '/pages/school'));
app.use(express.static(path.join(__dirname, 'pages')));

const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// const io = socketIO(server, {
//     cors: {
//         origin: "http://localhost:3050",
//         credentials: true,
//     },
// });

// io.on("connection", (socket) => {
//     socket.on("newChatMessage", (data) => {
//         const { roomId, sender, messageType, messageText } = data;
//         const obj = {
//             roomId,
//             sender,
//             messageType,
//             message: messageText,
//             timeStamp: new Date(),
//         }

//         const messageMongo = new Message(obj);
//         messageMongo.save();

//         socket.emit("groupMessage", obj);
//         chatgroups.push(obj);
//         // socket.emit("groupList", chatgroups);
//         socket.emit("foundGroup", chatgroups);
//     });

//     socket.on("connect_error", (err) => {
//         // the reason of the error, for example "xhr poll error"
//         console.log(err.message);

//         // some additional description, for example the status code of the initial HTTP response
//         console.log(err.description);

//         // some additional context, for example the XMLHttpRequest object
//         console.log(err.context);
//     });
// })
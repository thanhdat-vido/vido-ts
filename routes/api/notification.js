// require("dotenv").config();
// const { default: axios } = require("axios");
// const express = require("express");
// const { getDocs, collection } = require("firebase/firestore");
// const { database } = require("../../config/firebase");
// const admin = require("firebase-admin");
// // const serviceAccount = require("../../vido-student-beta-firebase-adminsdk-4rkqd-1360fc04f3.json");
// const { v4: uuidv4 } = require("uuid");
// const { sliceIntoChunks } = require("../../utils/index");
// const NotificationModel = require("../../models/notification");
// const serviceAccount = {

//   type: process.env.GOOGLE_TYPE,
//   project_id: process.env.GOOGLE_PROJECT_ID,
//   private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  
//   private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  
//   client_email: process.env.GOOGLE_CLIENT_EMAIL,
//   client_id: process.env.GOOGLE_CLIENT_ID,
  
//   auth_uri: process.env.GOOGLE_AUTH_URI,
//   token_uri: process.env.GOOGLE_TOKEN_URI,
//   auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
//   client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
//   universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
// };


// const router = express.Router();
// const chunkSize = 500;

// router.get("/get", async (req, res) => {
//   try {
//     const tokenCol = collection(database, "users");
//     const data = await getDocs(tokenCol);
//     const fcmTokens = data.docs.map(doc => doc.data()?.fcmToken);
//     res.status(200).send({
//       fcmTokens: fcmTokens.filter(x => x != null)
//     });
//   }
//   catch (err) {
//     res.status(400).send('Something went wrong!');
//     console.log(err);
//   }
// })

// router.post("/send", (req, res) => {
//   var notification = {
//     title: req.body.title,
//     body: req.body.message,
//   }

//   let totalSuccessCount = 0;
//   let totalFailureCount = 0;
//   var fcm_tokens = req.body.fcmTokens;

//   const headers = {
//     'Authorization': 'key=' + process.env.SERVER_KEY,
//     'Content-Type': 'application/json'
//   }

//   try {
//     for (let i = 0; i < fcm_tokens.length; i += chunkSize) {
//       const chunk = fcm_tokens.slice(i, i + chunkSize);
//       var notification_body = {
//         "registration_ids": chunk,
//         "notification": notification,
//       }

//       axios.post("https://fcm.googleapis.com/fcm/send", notification_body, {
//         headers: headers
//       }).then((response) => {
//         totalSuccessCount += response.data.success;
//         totalFailureCount += response.data.failure;
//         res.status(200).send({
//           success: totalSuccessCount,
//           failure: totalFailureCount
//         });
//       }).catch((err) => {
//         res.status(400).send('Something went wrong!');
//         console.log(err);
//       })
//       console.log("res: ", totalSuccessCount, totalFailureCount);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// router.get("/", (req, res) => {
//   res.send("Viendongedu notification!");
// });

// router.post("/test", function (req, res) {
//   console.dir(req.body);
//   res.send("tested");
// });

// router.post("/notify", async function (req, res) {
//   const data = req.body;
//   let success = 0;
//   let fail = 0;
//   const tokens = data.tokens || [];
//   const listToken = tokens.length > 0 ? tokens.reduce((acc, obj) => {
//     obj?.DeviceTokens.forEach(token => {
//       if (!acc.includes(token)) {
//         acc.push(token);
//       }
//     });
//     return acc;
//   }, []) : [];
//   const listUser = tokens.length > 0 ? tokens.reduce((acc, obj) => {
//     return [...acc, obj?.hocVienId];
//   }, []) : [];
//   // for (const tokenChunk of sliceIntoChunks(data.tokens, 400)) {
//   const message = {
//     notification: {
//       title: data.title,
//       body: data.msg,
//     },
//     tokens: listToken,
//   };
//   try {
//     const response = await admin.messaging().sendEachForMulticast({
//       tokens: listToken,
//       notification: {
//         title: data.title,
//         body: data.msg,
//       }
//     });

//     console.log("📊 Firebase response:", response);

//     response.responses.forEach((resp, idx) => {
//       if (!resp.success) {
//         console.error(`❌ Token failed [${listToken[idx]}]:`, resp.error.code, resp.error.message);
//       }
//     });

//     success = response.successCount;
//     fail = response.failureCount;
//   } catch (error) {
//     console.log("❌ Error sending notifications:", error);
//     res.status(500).send({ error: "Error in sending notifications" });
//     return;
//   }

//   try {
//     const newNotification = new NotificationModel({
//       title: data?.title,
//       notifyID: data?.notiId,
//       body: data?.msg,
//       status: 0,
//       users: listUser.map((e) => ({
//         userID: e,
//         status: 0,
//       })),
//     });

//     // Save the document to the database
//     newNotification
//       .save()
//       .then((savedNotification) => { })
//       .catch((error) => {
//         console.error("Error saving notification:", error);
//       });
//   } catch (error) {
//     console.log(error);
//   }
//   res.send({
//     success,
//     fail,
//   });
// });

// router.get("/notify", async function (req, res) {
//   try {
//     const studentID = req?.query?.studentID;

//     if (!studentID) {
//       return res.status(400).json({
//         result: "error",
//         message: "Missing 'studentID' parameter in the request",
//         data: [],
//       });
//     }

//     const foundNotifications = await NotificationModel.find({
//       "users.userID": studentID,
//     });

//     if (foundNotifications?.length > 0) {
//       const mappedNotifications = foundNotifications.map((notification) => ({
//         id: notification?.notifyID,
//         title: notification?.title,
//         body: notification?.body,
//         status: notification?.users?.find((user) => user?.userID == studentID)
//           ?.status,
//         sentAt: notification?.sentAt,
//       }));

//       res.json({
//         result: "success",
//         data: mappedNotifications,
//       });
//     } else {
//       res.json({
//         result: "success",
//         data: [],
//       });
//     }
//   } catch (error) {
//     console.error("Error querying notification:", error);
//     res.status(500).json({
//       result: "error",
//       message: "Internal server error",
//       data: [],
//     });
//   }
// });

// router.get("/notify/all", async function (req, res) {
//   try {
//     const notifications = await NotificationModel.aggregate([
//       { $sort: { createdAt: -1, _id: -1 } },
//       {
//         $group: {
//           _id: "$notifyID",
//           doc: { $first: "$$ROOT" },
//         },
//       },

//       { $replaceRoot: { newRoot: "$doc" } },
//       { $project: { users: 0, } },
//     ]);

//     if (notifications?.length > 0) {
//       res.json({
//         result: "success",
//         data: notifications,
//       });
//     } else {
//       res.json({
//         result: "success",
//         data: [],
//       });
//     }
//   } catch (error) {
//     console.error("Error querying notification:", error);
//     res.status(500).json({
//       result: "error",
//       message: "Internal server error",
//       data: [],
//     });
//   }
// });

// router.put("/notify", async function (req, res) {
//   try {
//     const requestBody = req?.body;
//     const userID = requestBody?.userID;
//     const notifyDocument = await NotificationModel.findOne({
//       "users.userID": userID.toString(),
//       notifyID: requestBody?.id,
//     });
//     if (!notifyDocument) {
//       return res.status(404).json({
//         result: "error",
//         message: "Notification not found for the given userID and notifyID",
//       });
//     }

//     const userIndex = notifyDocument.users.findIndex(
//       (user) => user.userID === userID
//     );

//     if (userIndex === -1) {
//       return res.status(404).json({
//         result: "error",
//         message: "User not found in the notification document",
//       });
//     }

//     let userList = [...notifyDocument.users];
//     userList[userIndex].status = requestBody?.status;

//     const newDocument = {
//       ...notifyDocument.toObject(),
//       users: userList,
//     };

//     NotificationModel.updateOne(
//       {
//         "users.userID": userID,
//         notifyID: requestBody?.id,
//       },
//       newDocument
//     )
//       .then(() => {
//         res.json({
//           result: "success",
//           message: "Notification updated successfully",
//         });
//       })
//       .catch((error) => {
//         console.error("Error updating notification:", error);
//         res.status(500).json({
//           result: "error",
//           message: "Internal server error",
//         });
//       });
//   } catch (error) {
//     console.log(error);
//     res.send({
//       result: "error",
//     });
//   }
// });

// router.put("/notify/all", async function (req, res) {
//   try {
//     const data = req.body;
//     await NotificationModel.updateMany({}, { $set: { notifyID: data.notifyID } });
//     res.json({
//       result: "success",
//       data: [],
//     });

//   } catch (err) {
//     console.error("Error querying notification:", error);
//     res.status(500).json({
//       result: "error",
//       message: "Internal server error",
//       data: [],
//     });
//   }
// })

// router.delete("/notify", async function (req, res) {
//   try {
//     const id = req?.query?.id;

//     if (!id) {
//       return res.status(400).json({
//         result: "error",
//         message: "Missing 'id' parameter in the request",
//         data: [],
//       });
//     }

//     const deleted = await NotificationModel.deleteMany({
//       _id: id
//     });

//     res.json({
//       result: "success",
//       data: [],
//     });
//   } catch (error) {
//     console.error("Error querying notification:", error);
//     res.status(500).json({
//       result: "error",
//       message: "Internal server error",
//       data: [],
//     });
//   }
// });

// router.post("/notifyUser", function (req, res) {
//   const data = req.body;
// });

// // Initialize Firebase
// router.post("/notifyToken", function (req, res) {
//   for (const token of sliceIntoChunks(req.body.tokens, 200)) {
//     sendMessage(token, req.body.title, req.body.msg, req.body.channel);
//   }
//   res.send("Sent!");
// });

// async function sendMessage(token, title, msg, channel) {
//   // Fetch the tokens from an external datastore (e.g. database)
//   // Send a message to devices with the registered tokens
//   // const tokens=[token];

//   await admin.messaging().sendEachForMulticast({
//     token,
//     data: {
//       notifee: JSON.stringify({
//         body: msg,
//         android: {
//           channelId: channel,
//           actions: [
//             {
//               title: title,
//               pressAction: {
//                 id: "read",
//               },
//             },
//           ],
//         },
//       }),
//     },
//   });
// }

// module.exports = router;
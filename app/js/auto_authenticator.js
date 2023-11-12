
// var awaitingLogin = false;
// const server = require("http").createServer();
// const socketIO = require("socket.io")(server);

// const $loginAuthenticator = $(".ui.login.authenticator");

// server.listen(50490);
// socketIO.on("connect", function (socket) {
//   console.log('io.onConnect');
//   $loginAuthenticator.removeClass("disabled");

//   socket.on("disconnect", function () {
//     console.log('socket.onDisconnect');
//     $loginAuthenticator.addClass("disabled");
//     $(".ui.authenticator.dimmer").removeClass("active");
//     awaitingLogin = false;
//   });

//   $loginAuthenticator.click(function () {
//     $(".ui.authenticator.dimmer").addClass("active");
//     awaitingLogin = true;
//     socket.emit("awaitingLogin");
//   });

//   socket.on("newLogin", function (data) {
//     console.log('socket.onNewLogin');
//     if (awaitingLogin) {
//       settings.set("access_token", data.access_token);
//       settings.set("subdomain", data.subdomain);
//       checkLogin();
//     }
//   });
// });
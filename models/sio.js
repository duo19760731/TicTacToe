var socketio = require('socket.io');
var dateformat = require('dateformat');

module.exports = sio;

function sio(server) {

  // Socket.IO
  var sio = socketio.listen(server);
  sio.set('transports', [ 'websocket' ]);

  // 接続
  sio.sockets.on('connection', function(socket) {

    // 通知受信
    socket.on('notice', function(data) {
      // すべてのクライアントへ通知を送信
      // ブロードキャスト
      socket.broadcast.emit('recieve', {
        type : data.type,
        user : data.user,
        value : data.value,
        time : dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
      });
    });

    // 切断
    socket.on("disconnect", function() {
    });
  });
}
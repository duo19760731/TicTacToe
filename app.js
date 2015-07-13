var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dateformat = require('dateformat');


/*
 * [[ 1 ]] 変数設定
 */
var routes = require('./routes/index');
var prototypeS7 = require('./routes/prototypeS7');
var prototypeS8 = require('./routes/prototypeS8');



// 基本設定
var app = require('express')();
var http = require('http').Server(app);

// Socket.io 1.3.5用
var io = require('socket.io')(http);
http.listen(80);			// ポート指定
var socketCount = 0;	// socket接続数
var userHash = {};		// ユーザ管理ハッシュ

/*
 * Socket.IO APIを用いたサーバ側実装（分離できないかな？）
 */
io.on('connection', function (socket) {

  // connect
  socketCount++;
  io.sockets.emit('socketCountChange', socketCount);


  // 通知受信
  socket.on('notice', function(data) {
    io.emit('socketRecieve', {
        type  : data.type,
        user  : data.user,
        value : data.value,
        time  : dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss'),
    });

    // userHash[socket.id] = data.user;
    //TODO 部屋を抜けた時の処理
    userHash[socketCount] = data.user;
    io.emit('socketRoomIn', {
      userA : userHash[1],
      userB : userHash[2],
    });
  });


  // マーク状況
  socket.on('mark', function(data) {
        // ブロードキャスト（送信者以外の全員に送信）
        socket.broadcast.emit('socketMark', {
          mark : data.mark,
        });
      });

  // 攻撃処理
  socket.on('attact', function(data) {
        io.emit('socketRecieveAct', {
            type       : data.type,
            id         : data.id,
            className  : data.className,
            clickCount : data.clickCount,
        });
        socket.broadcast.emit('socketOpponent', {
          action       : 'attack',
        });
      });

  // キャラクター状態
  socket.on('chara', function(data) {
        io.emit('socketChara', {
          charaA : data.charaA,
          charaB : data.charaB,
        });
      });

  // キャラクター利用者
  socket.on('determineChara', function(data) {
    io.emit('socketDetermineChara', {
      userNameA : data.userNameA,
      userNameB : data.userNameB,
    });
  });

  // 勝敗判定
  socket.on('call', function(data) {
        socket.broadcast.emit('socketMess', {
          decision     : data.decision,
          endFlag      : 'on',
        });
      });



  // 切断
  socket.on("disconnect", function() {
    socketCount--;
    io.sockets.emit('socketCountChange', socketCount);
  });


  // 各メソッドへの配置検討
  socket.on('my other event', function (data) {
  });


  socket.on('chat message', function(msg){
    // ioを使用する事で、接続した
    io.emit('chat message', msg);
  });


});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



/*
 * [[ 2 ]] app.useの設定
 */
app.use('/', routes);
app.use('/prototypeS7', prototypeS7);
app.use('/prototypeS8', prototypeS8);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
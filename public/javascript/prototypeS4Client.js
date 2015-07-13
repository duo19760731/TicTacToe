// socket.io接続
var socket = io.connect('http://localhost');
//var socket = io.connect();

//イベントの登録
$(document).ready(function() {
  console.log('<<0>> : Event Add');
  $(window).on('beforeunload', function(e) {
    // ログアウト通知
    emit('logout');
  });

  // 送信ボタンのコールバック設定
  $('#send').click(sendMessage);
});


// 接続時 :  function()の場合は、最初の最初なのでログイン扱い
socket.on('connect', function() {
  console.log('<<1>> : login');
  // ログイン通知
  emit('login');
});

// 切断時
socket.on('disconnect', function(client) {

});

// 受信時
socket.on('recieve', function(data) {
  console.log('<<2>> : ');
  var item = $('<li>').append($('<small>').append(data.time));

  // data.typeを解釈し、要素を生成する
  if (data.type === 'login') {
    item.addClass('alert alert-success').append($('<div>').append(data.user + 'がログインしました～！'));
  } else if (data.type === 'logout') {
    item.addClass('alert alert-danger').append($('<div>').append(data.user + 'がログアウトしました～！！'));
  } else if (data.type === 'chat') {
    var msg = data.value.replace(/[!@$%<>'"&|]/g, '');
    item.addClass('well well-lg').append($('<div>').text(msg)).children('small').prepend(data.user + '：');
  } else {
    item.addClass('alert alert-danger').append($('<div>').append('不正なメッセージを受信しました（* _ *）'));
  }

  $('#chat-area').prepend(item).hide().fadeIn(800);
});



// [01]イベント発信
function emit(type, msg) {
console.log('<<--->> : '+ type + ':' + msg);
  socket.emit('notice', {
    type : type,
    user : $('#username').val(),
    value : msg,
  });

}

// クライアントからメッセージ送信
function sendMessage() {
  // メッセージ取得
  var msg = $('#message').val();
  // 空白にする
  $('#message').val("");
  // メッセージ通知
  emit('chat', msg);
}
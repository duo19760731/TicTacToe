var socket = io.connect('http://localhost');
//var socket = io();

$('form').submit(function(){
  console.log('[1]Browser -> onClick or submit')
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(msg){
  console.log('[4]Browser -> on '+ msg);
  $('#messages').append($('<li>').text(msg));
});

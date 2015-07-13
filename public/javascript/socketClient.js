var socket = io();


$('form').submit(function(){
  console.log('hideo-------1500001')
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('chat message', function(msg){
  $('#messages').append($('<li>').text(msg));
});



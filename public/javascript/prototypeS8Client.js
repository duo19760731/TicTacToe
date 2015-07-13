// socket.io接続
var socket = io.connect();


/**
 * [01]ページ生成
 * jQueryの基本
 * HTML=DOMの読み込みが終わったらfunction()の中の処理(=なにかしらの処理)を実行する
*/
$(document).ready(function() {
  // console.log('【prototypeS8Client[2-0]】 : コンストラクタ');
  $(window).on('beforeunload', function(e) {
    // ログアウト通知
    emit('logout');
  });

  // 送信ボタンのコールバック設定（id名）
  $('#send').click(sendMessage);
});



/**
 * ページ処理内アクション ： メッセージ送信
 *
 *
*/
function sendMessage() {
  var msg = $('#message').val();    // メッセージ取得
  $('#message').val("");            // 空白にする
  emit('chat', msg);                // 関数呼び出し：メッセージ通知
}



/**
 * [02]socketイベント発信
 * サーバー（socket）に発信
 * JavaScriptにはデフォルト引数の機能はありません。
*/
function emit(type, data1) {

  switch (type){
    case 'act':
//      console.log('【prototypeS8Client[2-*]】 : イベント発生(emit-act) / type = '+ type + ' / data1 ' + data1.id + ' / data2 '+ data1.className);
      socket.emit('attact', {
        type       : type,
        id         : '#'+data1.id,
        className  : data1.className,
        clickCount : data1.clickCount,
      });
      break;
    case 'call':
      socket.emit('call', {
        decision : data1
      });
      break;
    case 'chara':
//      console.log('【function】 : キャラ変更'+ data1.charaA + '||' + data1.charaB);
      socket.emit('chara', {
        charaA : data1.charaA,
        charaB : data1.charaB,
      });
      break;
    case 'determineChara':
      socket.emit('determineChara', {
        userNameA : data1.userNameA,
        userNameB : data1.userNameB,
      });
    break;
    case 'mark':
      socket.emit('mark', {
        mark : data1
      });
      break;

    default:
      socket.emit('notice', {
        type : type,
        user : $('#username').val(),
        value : data1,
      });
    break;
  }
}



/**
 * [03]共有化処理
 *
 *
*/
// 受信時（Serverより）:chat
socket.on('socketRecieve', function(data) {
// console.log('【prototypeS8Client[2-**]】 : サーバーより受け取り');
// console.log('【prototypeS8Client[1-1] 】 : ログイン処理共有' + $('#socketCount').val());
  var item = $('<li>').append($('<small>').append(data.time));

  // data.typeを解釈し、要素を生成する
  if (data.type === 'login') {
    item.addClass('alert alert-success').append($('<div>').append(data.user + ' logIn!!!!'));
  } else if (data.type === 'logout') {
    item.addClass('alert alert-danger').append($('<div>').append(data.user + ' logOut!!!!'));
  } else if (data.type === 'chat') {
    var msg = data.value.replace(/[!@$%<>'"&|]/g, '');
    item.addClass('well well-lg').append($('<div>').text(msg)).children('small').prepend(data.user + '：');
  } else {
    item.addClass('alert alert-danger').append($('<div>').append('不正なメッセージを受信しました（* _ *）'));
  }
  $('#chat-area').prepend(item).hide().fadeIn(800);

  // SocketID
  $('#selfId').val(socket.id);
});
// [03]共有化処理 : ボード更新
socket.on('socketRecieveAct', function(data) {
  $(data.id).removeClass("btn").addClass(data.className);
  $('#turn').val(data.clickCount);
});
//[03]共有化処理 : 入室ユーザー情報
socket.on('socketRoomIn', function(data) {
  $('#resident1').val(data.userA);
  $('#resident2').val(data.userB);
});
// [03]共有化処理 : 攻守変更
socket.on('socketOpponent', function(data) {
  $('#action').val(data.action);
});

//[03]共有化処理 : キャラクター利用者
socket.on('socketDetermineChara', function(data) {
  $('#userNameA').val(data.userNameA);
  $('#userNameB').val(data.userNameB);
});

// [03]共有化処理 : キャラクター状態
socket.on('socketChara', function(data) {
  $('#userA').removeClass($('#userA').attr('class')).addClass(data.charaA);
  $('#userB').removeClass($('#userB').attr('class')).addClass(data.charaB);
});
// [03]共有化処理 : マーク状況
socket.on('socketMark', function(data) {
  $('#mark').removeClass('mark').addClass(data.mark);
});
// [03]共有化処理 : 終了報告
socket.on('socketMess', function(data) {
  $('#vod').val(data.decision);
  $('#endFlag').val(data.endFlag);
});
// console.log('【prototypeS6Client[2-**]】 : マーク情報' + JSON.stringify(data));
// console.log('【prototypeS6Client[2-**]】 : キャラ処理、受け取り' + JSON.stringify(data));
// console.log('【prototypeS6Client[2-**]】 : アタック処理、受け取り' + JSON.stringify(data));




//接続時 :  function()の場合は、最初の最初なのでログイン扱い
socket.on('connect', function() {
  emit('login');	  // ログイン通知
});
//接続カウント
socket.on('socketCountChange', function(count) {
  $('#socketCount').val(count);
});
//切断時
socket.on('disconnect', function(client) {
  $('#turn').val("");
});




/**
 * 大戦ボード&ボタン作成
 *
 *
*/
(function() {
'use strict';
  var size = 3;
  var userA = [];
  var userB = [];
  var endFlag = false;

  // bordを繋げる
  var board = document.getElementById('board');
  var giveUpButton = document.getElementById('giveUpButton');

  // ボード初期化
 initBoard();


  /**
   * 大戦ボード作成
   *
   *
  */
  function initBoard() {
    // ボタン用の配列
    var buttons = [];
    // buttons
    var count = 1;
    for (var i = 0; i < size * size; i++) {
      buttons.push(createButton(i));
      board.appendChild(buttons[i]);
        if ( count % 3 === 0 ) {
          board.appendChild(document.createElement('br'));
        }
      count++;
    }
  }


  /**
   * ボタン処理系(マルバツ、Start、GiveUp)
   *
   *
  */
  // 宣言不要？？？
  var clickCount = 0;
  var sockeCount, winnerCheck, action, endFlag, charaA, charaB;
  var checkeredFlag = false;

  function createButton(num) {
    var button;

    // エレメント生成
          button = document.createElement('div');
          button.id = 'act'+num;
          button.className = 'btn';
          button.innerHTML = '_';

          // イベントリスナー
          button.addEventListener('click', function() {
              var gameData = {};
              sockeCount = $('#socketCount').val();
              clickCount = $('#turn').val();
              action  = $('#action').val();
              endFlag = $('#endFlag').val();
              gameData['charaA']  = $('#userA').attr('class');
              gameData['charaB']  = $('#userB').attr('class');

              // クリック・イベント
              //TODO if重なりすぎ!!!!
              if ( this.className === 'btn' ) {
                if ( sockeCount >= 2 ) {
                  if ( endFlag !== 'on' ) {
                    if (action === 'attack') {
                      //TODO ユーザーを識別→Room or Socket.id or .....etc
                      // classNameも個別にもてるか？
                      if ( clickCount % 2 === 0) {
                          // 置いた場所取得
                          userA.push(this.id.replace(/act/g,""));
                          winnerCheck = userA.sort();
                          gameData['className'] = 'btn maru';
                      } else {
                          userB.push(this.id.replace(/act/g,""));
                          winnerCheck = userB.sort();
                          gameData['className'] = 'btn batu';
                      }
                      gameData['id'] = this.id;
                      gameData['clickCount'] = ++clickCount;
                      emit('act', gameData );
                      $('#action').val('defense');
                    } else {
                      $('#vod').val('Wait for me.');
                    }

                    // 先手順方式
                    // count1回目の時に、自分の駒を教える

                    if ( clickCount === 1) {
                      $('#mark').removeClass("mark").addClass('markMaru');
                      emit('mark', 'markBatu' );

                      gameData['userNameA'] = $('#username').val();

                      if ( gameData['userNameA'] == $('#resident1').val()){
                        gameData['userNameB'] = $('#resident2').val();
                      } else {
                        gameData['userNameB'] = $('#resident1').val();
                      }

                      emit('determineChara', gameData);

                    }

                  } else {
                    $('#vod').val('勝負はついたんだ！もうおわりだよ');
                  }
                } else {
                  $('#vod').val('対戦相手待ち');
                }





              }

              // ■勝ちチェック
              // 三手目以降から動かすかorリーチ判定をいれるか
              // 配列比較はtoString
              var winner = new Object();
              winner[0] = ["0", "1", "2"];
              winner[1] = ["3", "4", "5"];
              winner[2] = ["6", "7", "8"];
              winner[3] = ["0", "3", "6"];
              winner[4] = ["1", "4", "7"];
              winner[5] = ["2", "5", "8"];
              winner[6] = ["0", "4", "8"];
              winner[7] = ["2", "4", "6"];

              for (var key in winner) {
                var line = 0;
                for (var key2 in winner[key]){
                  if(winnerCheck.indexOf(winner[key][key2]) !== -1) {
                    line += 1;
                  }
                }
                // LINE3本で勝ち
                if ( line === 3 ){
                //【重要】相手にも、勝負終了フラグを渡す。
                  checkeredFlag = true;
                  $('#vod').val('You Win !!!');
                  emit('call', 'You Lose !!!' );
                  endFlag = 'on';
                }
                // LINE2本の時はリーチ
                if ( line === 2 ){
                  // バースト宣言
                  if ( clickCount % 2 === 0) {
                    gameData['charaB']  = 'charaB burst';
                  } else {
                    gameData['charaA']  = 'charaA burst';
                  }
                }
              }

              emit('chara', gameData );

              // ■終了処理
              if (clickCount === size * size ) {
                $('#vod').val('A drawn match');
                emit('call', 'A drawn match' );
                endFlag = 'on';
              }
        });

        return button;
    }
})();
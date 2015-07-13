// socket.io接続
var socket = io.connect();

/**
 * [01]ページ生成
 * jQueryの基本
 * HTML=DOMの読み込みが終わったらfunction()の中の処理(=なにかしらの処理)を実行する
*/
$(document).ready(function() {
console.log('【prototypeS6Client[2-0]】 : コンストラクタ');
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
console.log('【prototypeS6Client[2-1]】 : メッセージ[送信]ボタン押下');
  // メッセージ取得
  var msg = $('#message').val();
  // 空白にする
  $('#message').val("");

  // メッセージ通知
  emit('chat', msg);
}
/**
 * ページ処理内アクション ： ボタン押下処理
 *
 *
*/
function attackButton() {
console.log('【prototypeS6Client[2-]】 : ○×ボタン押下');
  // classを取得
  var msg = $('#message').val();
  $('#message').val("");
  emit('act', msg);
}




/**
 * [02]socketイベント発信
 * サーバー（socket）に発信
 * JavaScriptにはデフォルト引数の機能はありません。
*/
function emit(type, data1, data2) {
  if ( type === 'act') {
    console.log('【prototypeS6Client[2-*]】 : イベント発生(emit-act) / type = '+ type + ' / data1 ' + data1 + ' / data2 '+ data2);
    // 渡す（共有）するデータは、どのボタン、ボタンの状態、攻守、ターン
    socket.emit('attact', {
      type      : type,
      id        : '#'+data1,
      className : data2,
    });
  } else {
    console.log('【prototypeS6Client[2-*]】 : イベント発生(emit-etc) / type = '+ type + ' / msg ' + data1);
     socket.emit('notice', {
       type : type,
       user : $('#username').val(),
       value : data1,
     });
  }

}



/**
 * [03]共有化処理
 *
 *
*/
// 受信時（Serverより）
socket.on('socketRecieve', function(data) {
  console.log('【prototypeS6Client[2-**]】 : 受信処理');
  var item = $('<li>').append($('<small>').append(data.time));

  // data.typeを解釈し、要素を生成する
  if (data.type === 'login') {
    item.addClass('alert alert-success').append($('<div>').append(data.user + ' logIn!!!!'));
  } else if (data.type === 'logout') {
    item.addClass('alert alert-danger').append($('<div>').append(data.user + ' logOut!!!!'));
  } else if (data.type === 'chat') {
    var msg = data.value.replace(/[!@$%<>'"&|]/g, '');
    item.addClass('well well-lg').append($('<div>').text(msg)).children('small').prepend(data.user + '：');
  } else if (data.type === 'buttonCheck') {


  } else {
    item.addClass('alert alert-danger').append($('<div>').append('不正なメッセージを受信しました（* _ *）'));
  }

  $('#chat-area').prepend(item).hide().fadeIn(800);

});


// Act受信時（Serverより）
socket.on('socketRecieveAct', function(data) {

  console.log('【prototypeS6Client[2-***]】 : アクション処理受け取りました処理' + JSON.stringify(data));

  // $('#chat-area').prepend(item).hide().fadeIn(800);
  $(data.id).removeClass("btn").addClass(data.className);

});



//接続時 :  function()の場合は、最初の最初なのでログイン扱い
socket.on('connect', function() {
console.log('【prototypeS6Client[2-1]】 : Login');
  // ログイン通知
  emit('login');
});

//切断時
socket.on('disconnect', function(client) {
  console.log('【prototypeS6Client[2-]】 : 34');
});




/**
 * 大戦ボード&ボタン作成
 *
 *
*/
(function() {
  'use strict';
console.log('【prototypeS6Client[2-0]】 : ボード・ボタン作成');
  var size = 3;
  var userA = [];
  var userB = [];
  var endFlag = false;

  // bordを繋げる
  var board = document.getElementById('board');
  var giveUpButton = document.getElementById('giveUpButton');


  // ボード初期化
  initBoard();

/*  giveUpButton.addEventListener('click', function() {
    endFlag = true;
    if ( clickCount % 2 === 0) {
      alert('Player A gave up a game');
    }else{
      alert('Player B gave up a game');
    }
  });*/


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
  var clickCount = 0;
  var winnerCheck;
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
              // クリック・イベント
              if ( this.className === 'btn' ) {
                //TODO ユーザーを識別
                if ( clickCount % 2 === 0) {
                    // 置いた場所取得
                    userA.push(this.id);
                    winnerCheck = userA.sort();

                    // メッセージ通知
                    // こっちが正しいやり方かも。。。
                    // https://app.codegrid.net/entry/practical-jquery-1
                    emit('act', this.id, 'btn maru');
                }else{
                    // this.className = 'btn batu';
                    userB.push(this.id);
                    winnerCheck = userB.sort();
                    //emit('buttonCheck', 'prototypeS6Client.js is btn batu');
                    emit('act', this.id, 'btn batu');
                }

                // すべてのチェックが終わってからターンチェンジ
                if ( endFlag === false ) {
                  clickCount++;
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
                  checkeredFlag = true;
                }
              }

              // ■終了処理各種
              // 勝負あり(タイミング要調整)
              if (checkeredFlag) {
                if ( clickCount % 2 === 0) {
                  alert('Player B Wineer(×：白) !!');
                }else{
                  alert('Player A Wineer(○:赤) !!');
                }
                endFlag = true;
              } else if (clickCount+1 === size * size ) {
             // 引き分け
                alert('Draw...');
                endFlag = true;
              }
        });
        return button;
    }
})();
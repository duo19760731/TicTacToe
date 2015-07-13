// [1]基本設定
var mongoose = require('mongoose');
var db2 = mongoose.connect('mongodb://192.168.33.10:27017/prototype2');

//[2]スキーマ作成
var Schema = mongoose.Schema;

var labelSchema = new Schema({
   'label_id' : Number,
   'label_name' : String,
   'cost' : Number
 });

var label = mongoose.model('githublabels', labelSchema);

var issueSchema = new Schema({
  'gtihub_id' : Number,
  'number'    : Number,
  'title'     : String,
  'cost'      : Number,
  'state'     : String,
  'created_at' : Date,
  'updated_at' : Date,
  'closed_at'  : Date,
 });
 var issue = mongoose.model('githubissues', issueSchema);



exports.label = label;
exports.issue = issue;

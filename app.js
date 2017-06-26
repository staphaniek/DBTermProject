var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var app = express();

app.get('/', function(req,res){
  res.send('<h1 style = 'color'>ALPS 관리 시스템</h1>');
});
/*
var conn = mysql.createConnection({
  host : 'localhost',
  port : '3306',
  user : 'root',
  database : 'test'
});
conn.connect();
var sql = 'SELECT * FROM course';
conn.query(sql, function(err, rows, columns){
  if(err){
    console.log(err);
  }else{
    console.log('rows',rows);
    console.log('columns',columns);
  }
});
conn.end();
*/
app.listen(3000, function(){
  console.log('Connected 3000 port!!');
});

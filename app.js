var mysql = require('mysql');
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

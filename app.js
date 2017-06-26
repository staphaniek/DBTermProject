var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.locals.pretty = true;
app.set('views','./views'); // view file을 set 시켜주는 작업
app.set('view engine', 'pug');
var conn = mysql.createConnection({
  host : 'localhost',
  port : '3306',
  user : 'root',
  database : 'dbterm'
});
conn.connect();
/*
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
app.get(['/home/:id'], function(req,res){
  var id = req.params.id;
  if(req.cookies.user){
    var user=req.cookies.user;
    res.render('home',{user:user});
  }
  else{
    console.log(err);
    res.status(500).send('empty');
  }
});
app.get('/logout/:id', function(req,res){
  var user={};
  res.cookie('user', user);
  res.redirect('/');
});
app.post('/login', function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var sql = 'SELECT * FROM member where username=? and password=?';
  conn.query(sql,[username,password],function(err,result,field){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else if(result.length!=1){
      res.status(500).send('사용자의 username과 password가 맞지 않습니다');
    }
    else{
      var _id = result[0].id;
      var _name=result[0].name;
      var level = result[0].user_level;
      var user = {
        id:_id,
        username:username,
        name:_name,
        user_level:level
      };
      res.cookie('user',user);
      res.redirect('/home/'+_id);
    }
  });
});
app.get('/login', function(req,res){
  res.render('login');
});
app.post('/register', function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var name=req.body.name;
  var sql = 'SELECT * FROM member where username=?';
  conn.query(sql,[username],function(err,result,field){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else if(result.length>0){
      res.status(500).send('username이 중복됩니다. 다른 username을 사용하세요');
    }
    else{
      var user_level=1;
      sql = 'INSERT INTO member(username,password,name,user_level) VALUES(?,?,?,?)';
      conn.query(sql,[username,password,name,user_level], function(err,results,fields){
        if(err){
          console.log(err);
          res.status(500).send('Insert error');
        }
        else{
          var user = {
            id:results.insertId,
            username:username,
            name:name,
            user_level:1
          };
          res.cookie('user',user);
          res.redirect('/home/'+results.insertId);
        }
      });
    }
  });
});
app.get('/register', function(req,res){
  res.render('register');
});

app.get('/', function(req,res){
  var output = `
  <h1 style = "color=red"><a href="/">ALPS 관리 시스템</a></h1>
  <ul>
    <li>
      <a href="/register">회원가입</a>
    </li>
    <li>
      <a href="/login">로그인</a>
    </li>
  </ul>
  `;
  res.send(output);
});

app.listen(3000, function(){
  console.log('Connected 3000 port!!');
});

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
app.post('/topic/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var title = req.body.title;
  var content = req.body.content;
  var author = user.username;
  var sql = 'INSERT INTO topic(title, content, author) VALUES(?, ?, ?)';
  conn.query(sql, [title, content, author], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/topic/'+result.insertId);
    }
  });
});
app.get('/topic/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  res.render('addTopic', {user:user});
});
app.get(['/topic', '/topic/:id'], function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT id, title, author FROM topic order by id desc';
  conn.query(sql,function(err, topics, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('viewTopic',{user:user, topics:topics, topic:topic[0]});
        }
      });
    } else {
      res.render('viewTopic',{user:user, topics:topics});
    }
  });
});
app.post('/member/:id/delete',function(req,res){
  var id=req.params.id;
  var sql='DELETE FROM member WHERE id=?';
  conn.query(sql,[id],function(err,result,fields){
    res.redirect('/member/');
  });
});
app.get('/member/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM member WHERE id=?';
  var id = req.params.id;
  conn.query(sql,[id], function(err, member, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      if(member.length === 0){
        res.status(500).send('There is no record');
      }
      else{
        res.render('deleteMember', {user:user, member:member[0]});
      }
    }
  });
});
app.post(['/member/:id/edit'], function(req,res){
  var name=req.body.name;
  var user_level=req.body.user_level;
  var id=req.params.id;
  var sql = 'UPDATE member SET name=?, user_level=? WHERE id=?';
  conn.query(sql, [name, user_level, id], function(err,result,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/member/');
    }
  });
});
app.get(['/member/:id/edit'], function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM member';
  conn.query(sql,function(err, members, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM member WHERE id=?';
      conn.query(sql, [id], function(err, member, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('editMember',{members:members, member:member[0], user:user});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Error');
    }
  });
});
app.get(['/member', '/member/:id'], function(req,res){
  var sql = 'SELECT * FROM member';
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  conn.query(sql,function(err, members, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, member, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('member',{members:members, member:member[0], user:user});
        }
      });
    } else {
      res.render('member',{members:members, user:user});
    }
  });
});
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

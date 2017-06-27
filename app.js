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

////////////////////////////study///////////////////////////////////////////////
app.post('/study/:id/join', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var studyid=req.params.id;
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth();
  var semester=0;
  if(m<7)semester=1;
  else semester=2;
  var sql='SELECT * FROM takes where studentid=? and studyid=?';
  conn.query(sql, [user.id, studyid], function(err,results, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      if(results.length>0){
        return res.status(500).send('이미 신청한 스터디입니다!');
      }
      else{
        var sql = 'INSERT INTO takes(studentid, studyid, year, semester) VALUES(?, ?, ?, ?)';
        conn.query(sql, [user.id, studyid, y, semester], function(err, result, fields){
          if(err){
            console.log(err);
            res.status(500).send('Insert Error');
          }
          else{
            res.redirect('/take');
          }
        });
      }
    }
  });
});
app.get('/study/:id/join', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var id=req.params.id;
  var sql = 'SELECT * FROM study where studyid=?';
  conn.query(sql,[id],function(err, study, fields){
    if(err){
      console.log(err);
      res.status(500).send('신청 오류!');
    }
    else{
      res.render('joinStudy',{user:user, study:study[0]});
    }
  });
});
app.get('/lecture', function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM teaches natural join study WHERE lecturerid=?';
  conn.query(sql,[user.id],function(err, lectures, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.render('lecture', {user:user, lectures:lectures});
    }
  });
});
app.post('/study', function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var title=req.body.title;
  title=title+'%';
  var sql= 'SELECT * FROM study where title like ?';
  conn.query(sql,[title], function(err, studies, fields){
    if(err){
      console.log(err);
      res.status(500).send('검색 에러!');
    }
    else{
      res.render('study',{user:user, studies:studies});
    }
  });
});
app.get(['/study','/study/:id'], function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM study';
  conn.query(sql,[user.id],function(err, studies, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      var id = req.params.id;
      if(id){
        var sql = 'select * from member natural join teaches natural join study where member.id=teaches.lecturerid and study.studyid = teaches.studyid and study.studyid=?';
        conn.query(sql,[id], function(err, study, fields){
          if(err){
            console.log(err);
            res.state(500).send('Internal Server Error : 상세보기 에러');
          }
          else{
            res.render('viewStudy',{user:user, study:study[0]});
          }
        });
      }
      else{
        res.render('study', {user:user, studies:studies});
      }
    }
  });
});


////////////////////////////take////////////////////////////////////////////////
app.post('/take/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var studyid=req.params.id;
  var sql='DELETE FROM takes WHERE studentid=? and studyid=?';
  conn.query(sql,[user.id, studyid],function(err,result,fields){
    res.redirect('/take/');
  });
});
app.get('/take/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM study where studyid=?';
  var studyid = req.params.id;
  conn.query(sql,[studyid], function(err, study, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      if(study.length === 0){
        res.status(500).send('There is no record');
      }
      else{
        res.render('withdrawStudy', {user:user, study:study[0]});
      }
    }
  });
});
app.get('/take', function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM study , takes where takes.studyid=study.studyid and studentid=?';
  conn.query(sql,[user.id],function(err, takes, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.render('take', {user:user, takes:takes});
    }
  });
});

////////////////////////////lecturer////////////////////////////////////////////
app.post('/lecture/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var studyid=req.params.id;
  conn.beginTransaction(function(err){
    if(err){
      throw err;
    }
    var sql = 'DELETE from study where studyid=?';
    conn.query(sql, [studyid], function(err, result, fields){
      if(err){
        console.log(err);
        conn.rollback(function () {
          console.error('rollback error');
          throw err;
        });
        res.status(500).send('Delete Error');
      }
      else{
        var lecturerid=user.id;
        sql = 'DELETE FROM teaches where lecturerid=? and studyid=?';
        conn.query(sql,[lecturerid, studyid], function(err, results, fields){
          if(err){
            conn.rollback(function () {
              console.error('rollback error');
              throw err;
            });
            res.status(500).send('Delete Error');
          }
          else{
            sql='DELETE FROM takes where studyid=?';
            conn.query(sql, [studyid], function(err, result1, fields){
              if(err){
                conn.rollback(function(){
                  console.error('rollback error');
                  throw err;
                });
                res.status(500).send('Delete Error');
              }
              else{
                conn.commit(function (err){
                  if(err){
                    console.error(err);
                    conn.rollback(function () {
                      console.error('rollback error');
                      throw err;
                    });
                    res.status(500).send('Delete Error');
                  }
                  else{
                    res.redirect('/lecture');
                  }
                });
              }
            });
          }
        });
      }
    });
  });
});
app.get('/lecture/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM teaches natural join study WHERE lecturerid=? and studyid=?';
  var id = req.params.id;
  conn.query(sql,[user.id, id], function(err, lecture, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      if(lecture.length === 0){
        console.log('There is no record.');
        res.status(500).send('There is no record');
      }
      else{
        res.render('deleteStudy', {user:user, lecture:lecture[0]});
      }
    }
  });
});
app.post(['/lecture/:id/edit'], function(req,res){
  var title=req.body.title;
  var description=req.body.description;
  var id=req.params.id;
  var sql = 'UPDATE study SET title=?, description=? WHERE studyid=?';
  conn.query(sql, [title, description, id], function(err,result,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/lecture/');
    }
  });
});
app.get(['/lecture/:id/edit'], function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM teaches natural join study WHERE lecturerid=?';
  conn.query(sql,[user.id], function(err, lectures, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM study WHERE studyid=?';
      conn.query(sql, [id], function(err, lecture, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('editStudy',{user:user, lecture:lecture[0]});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Error');
    }
  });
});
app.post('/lecture/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var title = req.body.title;
  var description = req.body.description;
  var today = new Date();
  var y = today.getFullYear();
  var m = today.getMonth();
  var semester=0;
  if(m<7)semester=1;
  else semester=2;
  conn.beginTransaction(function(err){
    if(err){
      throw err;
    }
    var sql = 'INSERT INTO study(title, description, year, semester) VALUES(?, ?, ?, ?)';
    conn.query(sql, [title, description, y, semester], function(err, result, fields){
      if(err){
        console.log(err);
        conn.rollback(function () {
          console.error('rollback error');
          throw err;
        });
        res.status(500).send('Insert Error');
      }
      else{
        var studyid=result.insertId;
        sql = 'INSERT INTO teaches(lecturerid, studyid, year, semester) VALUES(?,?,?,?)';
        conn.query(sql,[user.id, studyid, y, semester], function(err, results, fields){
          if(err){
            conn.rollback(function () {
              console.error('rollback error');
              throw err;
            });
            res.status(500).send('Insert Error');
          }
          else{
            conn.commit(function (err){
              if(err){
                console.error(err);
                conn.rollback(function () {
                  console.error('rollback error');
                  throw err;
                });
                res.status(500).send('Insert Error');
              }
              else{
                res.redirect('/lecture');
              }
            });
          }
        });
      }
    });
  });
});
app.get('/lecture/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  res.render('addStudy', {user:user});
});
app.get('/lecture', function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM teaches natural join study WHERE lecturerid=?';
  conn.query(sql,[user.id],function(err, lectures, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.render('lecture', {user:user, lectures:lectures});
    }
  });
});

//////////////////////////////team/////////////////////////////////////////////
app.post('/team/:id/delete',function(req,res){
  var id=req.params.id;
  var sql='DELETE FROM team WHERE teamid=?';
  conn.query(sql,[id],function(err,result,fields){
    res.redirect('/team/');
  });
});
app.get('/team/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM team WHERE teamid=?';
  var id = req.params.id;
  conn.query(sql,[id], function(err, team, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      if(team.length === 0){
        res.status(500).send('There is no record');
      }
      else{
        res.render('deleteTeam', {user:user, team:team[0]});
      }
    }
  });
});
app.post('/team/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var teamname = req.body.teamname;
  var team_member1 = req.body.teammember1;
  var team_member2 = req.body.teammember2;
  var team_member3 = req.body.teammember3;
  var sql = 'SELECT * FROM team';
  conn.query(sql, function(err, teams, fields){
    if(err){
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
    else{
      for(var i=0;i<teams.length;i++){
        if(team_member1===teams[i].team_member1  || team_member1===teams[i].team_member2 || team_member1===teams[i].team_member3){
          return res.status(500).send('팀원1은 이미 팀이 있습니다');
        }
        if(team_member2===teams[i].team_member1  || team_member2===teams[i].team_member2 || team_member2===teams[i].team_member3){
          return res.status(500).send('팀원2는 이미 팀이 있습니다');
        }
        if(team_member3===teams[i].team_member1  || team_member3===teams[i].team_member2 || team_member3===teams[i].team_member3){
          return res.status(500).send('팀원3은 이미 팀이 있습니다');
        }
      }
      sql = 'INSERT INTO team(teamname, team_member1, team_member2, team_member3) VALUES(?, ?, ?, ?)';
      conn.query(sql, [teamname, team_member1, team_member2, team_member3], function(err, result, fields){
        if(err){
          console.log(err);
          return res.status(500).send('Insert Team Error');
        }
        else{
          res.redirect('/team/');
        }
      });
    }
  });
});
app.get('/team/add', function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  res.render('addTeam', {user:user});
});
app.get(['/team', '/team/:id'], function(req,res){
  var user={};
  if(req.cookies.user){
    var user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT * FROM team';
  conn.query(sql,function(err, teams, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM team WHERE id=?';
      conn.query(sql, [id], function(err, team, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('team',{teams:teams, team:team[0], user:user});
        }
      });
    } else {
      res.render('team',{teams:teams, user:user});
    }
  });
});
//////////////////////////////topic/////////////////////////////////////////////
app.post('/topic/:id/delete',function(req,res){
  var id=req.params.id;
  var sql='DELETE FROM topic WHERE id=?';
  conn.query(sql,[id],function(err,result,fields){
    res.redirect('/topic/');
  });
});
app.get('/topic/:id/delete',function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT id, title, author FROM topic';
  var id = req.params.id;
  conn.query(sql,function(err, topics, fields){
    var sql = 'SELECT * FROM topic WHERE id=?';
    conn.query(sql,[id],function(err,topic,fidle){
      if(user.user_level!=4 && user.username != topic[0].author){
        return res.status(500).send('권한이 없거나, 작성자가 아닙니다.');
      }
      else if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      }
      else{
        if(topic.length === 0){
          console.log('There is no record.');
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('deleteTopic', {user:user, topics:topics, topic:topic[0]});
        }
      }
    })
  });
});
app.post(['/topic/:id/edit'], function(req,res){
  var title=req.body.title;
  var content=req.body.content;
  var id=req.params.id;
  var sql = 'UPDATE topic SET title=?, content=? WHERE id=?';
  conn.query(sql, [title,content, id], function(err,result,fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/topic/'+id);
    }
  });
});
app.get(['/topic/:id/edit'], function(req,res){
  var user={};
  if(req.cookies.user){
    user=req.cookies.user;
  }
  else{
    console.log(err);
    return res.status(500).send('empty');
  }
  var sql = 'SELECT id, title, author FROM topic';
  conn.query(sql,function(err, topics, fields){
    var id = req.params.id;
    if(id){
      var sql = 'SELECT * FROM topic WHERE id=?';
      conn.query(sql, [id], function(err, topic, fields){
        if(user.user_level!=4 && user.username != topic[0].author){
          return res.status(500).send('권한이 없거나, 작성자가 아닙니다.');
        }
        else if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }
        else{
          res.render('editTopic',{user:user, topics:topics, topic:topic[0]});
        }
      });
    } else {
      console.log('There is no id.');
      res.status(500).send('Internal Server Error');
    }
  });
});
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
//////////////////////////////member/////////////////////////////////////////////
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

//////////////////////////////home/////////////////////////////////////////////
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

//////////////////////////////logout/////////////////////////////////////////////
app.get('/logout/:id', function(req,res){
  var user={};
  res.cookie('user', user);
  res.redirect('/');
});

//////////////////////////////login/////////////////////////////////////////////
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

//////////////////////////////register/////////////////////////////////////////////
app.post('/register', function(req,res){
  var username=req.body.username;
  var password=req.body.password;
  var apassword=req.body.apassword;
  var name=req.body.name;
  if(password!=apassword){
    return res.status(500).send('비밀번호와 비밀번호 확인이 맞지 않습니다');
  }
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

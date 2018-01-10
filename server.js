

var express=require('express');

var app = express();

var http = require('http').Server(app);

var crypto= require('crypto');

var mysql = require('mysql');

var bodyParser = require('body-parser');

var io=require('socket.io')(http);

app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');


var users=[];



var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"socket_chat"
});

con.connect(function(err) {
  if (err)
  {
      console.log(err);
  }
  else {
      console.log("Connected! to database socket_chat");
  }
});

/* router */


app.get('/404', function(req, res, next){
    next();
    });

    
app.get('/', function(req, res){

    res.render( 'index',{'kuch':'REGISTRATION'});

});
app.get('/login',function(req,res){
    res.render('login');
});


app.post('/logincheck', function(req, res){
    var mail=req.body.useremail;
    var password=req.body.password;
    var id=mail+password;
    id=crypto.createHash('md5').update(id).digest('hex');
    var sql='select * from users where id="'+id+'"';
    con.query(sql,function(err,result){
        if(err){
            
            console.log(err);
        }
        else if(result.length==0){
           
            res.end('not');
        }
        else{
            
            res.end(id);
        }
    });
    
    
});
app.get('/ChatRoom/:id', function(req, res){
    var id=req.params.id;
    var username=req.params.username;
    var sql='select * from users where id="'+id+'"';
    
    con.query(sql,function(err,result){
        if(err){
            console.log('sql error');
            console.log(err);
        }
        else if(result.length==0){
            
            res.end('not');
        }
        else{
            
            res.render('chatroom',{'id':id,'username':result[0].username});
        }
    

});
});

var users=[];

http.listen(3000, function(){

  console.log('listening on *:3000');

});
var reg=io.of('/registration');
/* connection initiate*/
reg.on('connection',function (socket) {
   
    /*  registration process */
    socket.on('registration',function (msg) {
        
        var email=msg.email;
        var username=msg.username;
        var password=msg.password;
        var id=msg.email+msg.password;
        id=crypto.createHash('md5').update(id).digest('hex');
        console.log(id);
        var sql='select id from users where email="'+email+'"';
        console.log(sql);
        con.query(sql,function(err,result,fields){
            if(err){
                console.log(err);
            }
            else if(result.length >0){
                socket.emit('userExist',{});
            }
            else{
                var qsql='insert into users(id,email,username,password) values("'+id+'","'+email+'","'+username+'","'+password+'")';
                console.log('insert query :'+qsql);
                con.query(qsql,function(err2,qresult,qfields){
                    if(err2){console.log('error'+err2);}
                    else{
                        socket.emit('registersuccess', 'Thank You ' + username + ' For Registration now <a href="/login">Login</a>');
                        console.log('user registered: ', username );
                    }
                })
            }
        });
        
    });
    socket.on('disconnect',function(){
        console.log('register io is closed');
    });
});

    /*  registration end */

var loginio=io.of('/login');
loginio.on('connection',function(socket){
    
    socket.on('loginsuccess',function(data){
        
        console.log(users.length);
        if(!users.includes(data))
        {
            var sql='update users set active=1 where id="'+data+'"';
            con.query(sql);
            users.push(data);
            console.log('user puch:',users);
        }
        
        socket.emit('redirect','/ChatRoom/'+data);
       
    });
    
});
var chat=io.of('/chat');
chat.on('connection',function(socket){
    var room='room1';
    socket.on('joinRoom',function(data){
        var roomid=data.myid+data.friendid;
        var roomid2=data.friendid+data.myid;
        roomid=crypto.createHash('md5').update(roomid).digest('hex');
        var sql='select * from room where id="'+roomid+'" OR id="'+roomid2+'"';
        con.query(sql,function(err,result){
            if(result.length==0){
                var sql='insert into room values("'+roomid+'","'+data.myid+'","'+data.friendid+'")';
                con.query(sql);
                socket.leave(room);
                socket.join('/'+roomid);
                room='/'+roomid;
            }
            else{
                socket.leave(room);
                socket.join('/'+result[0].id);
                room='/'+result[0].id;
                

            }
        });
    });
    
    socket.to(room).emit('naya','new user join');
    socket.on('newmessage',function(msg){
        console.log(msg.textmessage);
        socket.to(room).emit('getmessage',msg);
    });
    socket.on('logout',function(id){
        users.pop(id);
        if(!users.includes(id)){
            var sql='update users set active=0 where id="'+id+'"';
            con.query(sql);
            console.log('user logout');
            socket.broadcast.emit('newuserremovesuccess',id);
            socket.emit('logoutsucc','/login');
        }
        else{console.log(users);}
    });
    
    socket.on('userconnect',function(user){
        idofuser=user;
        
        
        if(!users.includes(idofuser)){
            socket.emit('usernahihain');
            
            
        }
        else{
            con.query('select id,username from users where id="'+user+'"',function(err,result){
                socket.emit('usernamefetch',result[0].username);
                socket.broadcast.emit('newuseraddsuccess',result);
            })

            var sql='select id,username from users where active=1 AND id!="'+user+'"';
            con.query(sql,function(err,result){
            
            socket.emit('fetchonlineusers',result);
            });
            
        }
       

    });

    



});

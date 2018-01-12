

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
var usersocket={};


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
    
    socket.join('94dbe2575d073999956c38753d8bcbef');
    con.query('select id,username from users where id !="4fba0847be33303e9014e979b7573822"',function(err,result){
        socket.emit('userlist',result);
    });

    socket.on('mychat',function(id){
        
        con.query('select groupid from participents where userid="'+id+'"' , function(err,result){
            
            
            for(i=0;i<result.length;i++)
            {
            
                sql='select id,name from groups where id="'+result[i].groupid+'"';
                con.query(sql,function(err,res){
                
                socket.emit('groupcreated',{'id':res[0].id,'name':res[0].name});
                
                
            });
            }
        
                
        });
        
    });
    socket.on('joingroupRoom',function(group){
        socket.leaveAll();
        socket.join(group);
    });
    socket.on('newgroupcreate',function(group){

        var grid=group.admin+group.name;
        grid=crypto.createHash('md5').update(grid).digest('hex');
        con.query('select id from groups where id="'+grid+'"',function(err,result){
            
            if(result.length==1){
                socket.emit('alreadyhavegroup');
            }
            else{
                var sql='insert into groups values("'+grid+'","'+group.admin+'","'+group.name+'")';
                con.query(sql,function(err,res){
                    if(!err){console.log('group created: '+group.name);}else{console.log(err);}
                    con.query('insert into participents values("'+grid+'","'+group.myid+'")');

                    for(i=0;i<group.members.length;i++){
                        con.query('insert into participents values("'+grid+'","'+group.members[i]+'")');
                        socket.to(usersocket[group.members[i]]).emit('groupcreated',{'id':grid,'name':group.name});
                    }
                    
                    
                    socket.emit('groupcreated',{'id':grid,'name':group.name});
                });
            }

        });
        
    });
    var getroom=function (myid,friendid,callback)
    {
        console.log('room called');
        if(friendid=='4fba0847be33303e9014e979b7573822'){return callback('94dbe2575d073999956c38753d8bcbef');}
        
        var roomid=myid+friendid;
        var roomid2=friendid+myid;
        roomid=crypto.createHash('md5').update(roomid).digest('hex');
        roomid2=crypto.createHash('md5').update(roomid2).digest('hex');
        
        var sql='select * from room where id="'+roomid+'" OR id="'+roomid2+'"';
        
        
        return con.query(sql,function(err,result){
                callback(result[0].id);
        });
    
    }
    

   
    socket.on('joinRoom',function(data){
        console.log('my id is '+data.myid);
        console.log('friend id is '+data.friendid);
        var roomid=data.myid+data.friendid;
        var roomid2=data.friendid+data.myid;
        roomid=crypto.createHash('md5').update(roomid).digest('hex');
        roomid2=crypto.createHash('md5').update(roomid2).digest('hex');
        var sql='select * from room where id="'+roomid+'" OR id="'+roomid2+'"';
        con.query(sql,function(err,result){
            if(result.length==0){
                var sql='insert into room values("'+roomid+'","'+data.myid+'","'+data.friendid+'")';
                con.query(sql);
                console.log('room join : '+roomid);
                socket.leaveAll();
                socket.join(roomid);
                
            }
            else{
                console.log('room joined:' +result[0].id);
                socket.leaveAll();
                socket.join(result[0].id);
                
                

            }
        });
    });
    socket.on('groupmassagerequired',function(id){
        
        
        con.query('select * from chat where id="'+id+'" ',function(err,result){
            
            con.query('select name from groups where id="'+id+'"',function(err,res1){
                socket.emit('allmessage',{'receiver':res1[0].name,'message':result});
                });
            });
    });
    
    socket.on('massagerequired',function(msid){
        var id=msid.myid+msid.friendid;
        var id2=msid.friendid+msid.myid;
        id2=crypto.createHash('md5').update(id2).digest('hex');
        id=crypto.createHash('md5').update(id).digest('hex');
        con.query('select * from chat where id="'+id+'" OR id="'+id2+'"',function(err,result){
            console.log(result);
            con.query('select username from users where id="'+msid.friendid+'"',function(err,res1){
                socket.emit('allmessage',{'receiver':res1[0].username,'message':result});
                });
            });
    });
    socket.on('newmessage',function(msg){
        console.log('sender: '+msg.sender+', receiver: '+msg.receiver+', message: '+msg.textmessage);
        getroom(msg.sender,msg.receiver,function(result){
            console.log('room: '+result);
            con.query('select username from users where id="'+msg.sender+'"',function(err,res1){
                socket.to(result).emit('roommessage',{'sender':res1[0].username,'textmessage':msg.textmessage});
                con.query('insert into chat values("'+result+'","'+msg.sender+'","'+msg.receiver+'","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(err,res){
               // console.log('inserted at  :'+result);
                });
            });
        });
        

        //socket.to(room).emit('getmessage',msg);
    });
    socket.on('logout',function(id){
        users.pop(id);
        delete usersocket[id];
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
            
            console.log(users);
            
            
        }
        else{
            con.query('select id,username from users where id="'+user+'"',function(err,result){
                socket.emit('usernamefetch',result[0].username);
                socket.broadcast.emit('newuseraddsuccess',result);
            })
            usersocket[user]=socket.id;
            console.log(usersocket);
            var sql='select id,username from users where active=1 AND id!="'+user+'"';
            con.query(sql,function(err,result){
            
            socket.emit('fetchonlineusers',result);
            });
            
        }
       

    });

    



});

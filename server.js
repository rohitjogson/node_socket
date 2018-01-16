

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
        
        var sql='select id from users where email="'+email+'"';
        
        con.query(sql,function(err,result,fields){
            if(err){
                console.log(err);
            }
            else if(result.length >0){
                socket.emit('userExist',{});
            }
            else{
                var qsql='insert into users(id,email,username,password) values("'+id+'","'+email+'","'+username+'","'+password+'")';
                
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
            console.log('user push:',users);
        }
        
        socket.emit('redirect','/ChatRoom/'+data);
       
    });
    
});
var chat=io.of('/chat');
chat.on('connection',function(socket){
    
    socket.join('94dbe2575d073999956c38753d8bcbef');
    con.query('select id,username from users where id !="4fba0847be33303e9014e979b7573822"',function(err,result){
        socket.emit('userlist',result);
        sql='select * from chat where id="94dbe2575d073999956c38753d8bcbef"';
        con.query(sql,function(err,result){
            con.query('select name from groups where id="94dbe2575d073999956c38753d8bcbef"',function(err,res1){
                if(res1.length!=0){
                socket.emit('allmessage',{'receiver':res1[0].name,'message':result});
                }
                });
        });
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
            con.query('select groupid from participents where userid="'+user+'"' , function(err,result){
                for(i=0;i<result.length;i++)
                {
                    
                    sql='select id,name from groups where id="'+result[i].groupid+'"';
                    con.query(sql,function(err,res){
                        socket.emit('groupcreated',{'id':res[0].id,'name':res[0].name});
                        getroom(user,res[0].id,function(rooom){
                            sqlk='select count(*) as num from chat where id="'+rooom+'" AND sender!="'+user+'" AND  datetime>(select time from userclick where roomid="'+rooom+'" AND userid="'+user+'")';
                            
                            con.query(sqlk,function(err,rest){
                                if(rest.length!=0){
                                    
                                    
                                    socket.emit('grnoti',{'id':rooom,'notification':rest[0].num});
                                }
                            });

                            
                        });
                    });
                }
            });
            
            var sql='select id,username from users where active=1 AND id!="'+user+'"';
            con.query(sql,function(err,result){
            
            socket.emit('fetchonlineusers',result);
            });
            
        }
       

    });
    socket.on('mynotification',function(ids){
        getroom(ids.me,ids.friend,function(roomdata){
           
            
            sqlquery='select count(*) as num from chat where id="'+roomdata+'" AND receiver="'+ids.me+'" AND  datetime>(select time from userclick where roomid="'+roomdata+'" AND userid="'+ids.me+'")';
            
            con.query(sqlquery,function(err,row){
                if(err){console.log(err);}
                
                socket.emit('yournotification',{'id':ids.friend,'notification':row[0].num});
            });
        });
    });
    socket.on('joingroupRoom',function(group){
       
        
        newsql='select * from userclick where userid="'+group.myid+'" AND roomid="'+group.group+'"';
        con.query(newsql,function(err,ress){
            
            if(ress.length==0){
                con.query('insert into userclick(roomid,userid) values("'+group.group+'","'+group.myid+'")');
            }
            else{
                con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+group.group+'" AND userid="'+group.myid+'"');
            }
        });
        socket.join(group.group);
        con.query('select * from chat where id="'+group.group+'" ',function(err,result){
            
            con.query('select name from groups where id="'+group.group+'"',function(err,res1){
                socket.emit('allmessage',{'receiver':res1[0].name,'message':result});
                
                });
            });
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
                    con.query('insert into room values("'+grid+'","'+group.admin+'","'+group.admin+'")',function(err,result){
                        
                    });
                    if(!err){console.log('group created: '+group.name);}else{console.log(err);}
                    con.query('insert into participents values("'+grid+'","'+group.myid+'")');
                    
                    for(i=0;i<group.members.length;i++){
                        con.query('insert into userclick(roomid,userid) values("'+grid+'","'+ group.members[i]+'")');
                        con.query('insert into participents values("'+grid+'","'+group.members[i]+'")');
                        socket.to(usersocket[group.members[i]]).emit('groupcreatedbyfriend',{'id':grid,'name':group.name});
                    }
                    
                    
                    socket.emit('groupcreated',{'id':grid,'name':group.name});
                });
            }

        });
        
    });
    var getroom=function (myid,friendid,callback){
        
        if(friendid=='4fba0847be33303e9014e979b7573822'){return callback('94dbe2575d073999956c38753d8bcbef');}
        
        var roomid=myid+friendid;
        var roomid2=friendid+myid;
        var room3=friendid;
        roomid=crypto.createHash('md5').update(roomid).digest('hex');
        roomid2=crypto.createHash('md5').update(roomid2).digest('hex');
        
        var sql='select * from room where id="'+roomid+'" OR id="'+roomid2+'" OR id="'+room3+'"';
        
        
        return con.query(sql,function(err,result){
            if(err){console.log('sql error:'+err);}
            else{
            if(result.length!=0){
                
                callback(result[0].id);
            }
            else{
                console.log('room not find');
            }
        }
        });
    
    }
    socket.on('joinRoom',function(data){
        
        var roomid=data.myid+data.friendid;
        var roomid2=data.friendid+data.myid;
        roomid=crypto.createHash('md5').update(roomid).digest('hex');
        roomid2=crypto.createHash('md5').update(roomid2).digest('hex');
        var sql='select * from room where id="'+roomid+'" OR id="'+roomid2+'"';
        con.query(sql,function(err,result){
            if(result.length==0){
                var sql='insert into room values("'+roomid+'","'+data.myid+'","'+data.friendid+'")';
                con.query(sql);
                
                newsql='select * from userclick where userid="'+data.myid+'" AND roomid="'+roomid+'"';
                con.query(newsql,function(err,ress){
                    

                    if(ress.length==0){
                        con.query('insert into userclick(roomid,userid) values("'+roomid+'","'+data.myid+'")');
                        con.query('select * from userclick where userid="'+data.myid+'" AND roomid="'+roomid+'"',function(err,roww){
                            if(roww.length==0)
                            {
                                con.query('insert into userclick(roomid,userid) values("'+roomid+'","'+data.friendid+'")');
                            }
                        });
                    }
                    else{
                        con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+roomid+'" AND userid="'+data.myid+'")');
                    }
                });
                
                
                socket.join(roomid);
                
            }
            else{
                
                newsql='select * from userclick where userid="'+data.myid+'" AND roomid="'+result[0].id+'"';
                con.query(newsql,function(err,ress){
                    
                    if(ress.length==0){
                        con.query('insert into userclick(roomid,userid) values("'+result[0].id+'","'+data.myid+'")');
                    }
                    else{
                        con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+result[0].id+'" AND userid="'+data.myid+'"');
                    }
                });
                
                socket.join(result[0].id);
                
                

            }
        });
    });
    socket.on('massagerequired',function(msid){
        var id=msid.myid+msid.friendid;
        var id2=msid.friendid+msid.myid;
        id2=crypto.createHash('md5').update(id2).digest('hex');
        id=crypto.createHash('md5').update(id).digest('hex');
        con.query('select * from chat where id="'+id+'" OR id="'+id2+'"',function(err,result){
            
            con.query('select username from users where id="'+msid.friendid+'"',function(err,res1){
                socket.emit('allmessage',{'receiver':res1[0].username,'message':result});
                });
            });
    });
    socket.on('typing',function(ur){
        ;
        getroom(ur.sender,ur.receiver,function(room){
            
            con.query('select username from users where id="'+ur.sender+'"',function(err,result){
                
                socket.to(room).emit('usertyping',{'room':room,'id':ur.sender,'name':result[0].username});
            });
            
        });
    });
    socket.on('update',function(id){
        getroom(id.user,id.frd,function(rrm){
            qr='select * from userclick where roomid="'+rrm+'"'
        });
    });
    socket.on('newmessage',function(msg){
        
        getroom(msg.sender,msg.receiver,function(result){
            

            con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+result+'" AND userid="'+msg.sender+'"');
            if(result==msg.receiver){
                qur='select userid from participents where groupid="'+result+'" AND userid!="'+msg.sender+'"';
                
                con.query(qur,function(err,results){
                    if(err){console.log(err);return false}
                    for(i=0;i<results.length;i++){
                        
                        socket.to(usersocket[results[i].userid]).emit('grnoti',{'id':msg.receiver,'notification':1});
                    

                    }
                });
                con.query('select username from users where id="'+msg.sender+'"',function(err,res1){
                    
                    socket.to(result).emit('roommessage',{'id':msg.sender,'sender':res1[0].username,'textmessage':msg.textmessage});
                    con.query('insert into chat(id,sender,receiver,massge,time,date) values("'+result+'","'+msg.sender+'","'+msg.sender+'","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(err,res){
               
                    });
                });
            }
            else{
                con.query('select username from users where id="'+msg.sender+'"',function(err,res1){
                    
                    socket.to(usersocket[msg.receiver]).emit('newnoti',{'id':msg.sender,'notification':1});
                    socket.to(result).emit('roommessage',{'is':msg.sender,'sender':res1[0].username,'textmessage':msg.textmessage});
                    con.query('insert into chat(id,sender,receiver,massge,time,date) values("'+result+'","'+msg.sender+'","'+msg.receiver+'","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(err,res){
               // console.log('inserted at  :'+result);
                    });
                });
            }
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
    
  

    

   
    


});

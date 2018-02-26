

var express=require('express');

var app = express();

var http = require('http').Server(app);

var crypto= require('crypto');

var mysql = require('mysql');

var bodyParser = require('body-parser');

var io=require('socket.io')(http);

var Promise=require('promise');
app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

app.set('views', __dirname + '/views');

app.set('view engine', 'ejs');


var users=[];
var usersocket={};
var usernames={};


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
    
    var idofuser;
    
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
                
                callback(roomid);
            }
        }
        });
    
    }
    socket.on('userconnect',function(user){
        idofuser=user;
        
        
        if(!users.includes(idofuser)){
            socket.emit('usernahihain');
            
            console.log(users);
            
            
        }
        else{
            con.query('select id,username from users where id="'+user+'"',function(err,result){
                usernames[result[0].id]=result[0].username;
                socket.emit('usernamefetch',result[0].username);
                socket.broadcast.emit('newuseraddsuccess',result);
            })
            usersocket[user]=socket.id;
            sql2='select * from groups where id!="94dbe2575d073999956c38753d8bcbef" AND status="pub" AND id NOT IN (select groupid from participents where userid="'+user+'")';
                    
                    con.query(sql2,function(errt,rslt){
                        if(errt){console.log(errt);}else{
                        for(i=0;i<rslt.length;i++){
                            socket.emit('groupspub',{'id':rslt[i].id,'name':rslt[i].name,'status':rslt[i].status});
                        }
                    }
                    });
            con.query('select groupid from participents where userid="'+user+'"' , function(err,result){
                for(i=0;i<result.length;i++)
                {
                    
                    sql='select id,name,status from groups where id="'+result[i].groupid+'"';
                    
                    con.query(sql,function(err,res){
                        socket.emit('groupcreated',{'id':res[0].id,'name':res[0].name,'status':res[0].status});
                        getroom(user,res[0].id,function(rooom){
                            sqlk='select count(*) as num from chat where id="'+rooom+'" AND sender!="'+user+'" AND  datetime>(select time from userclick where roomid="'+rooom+'" AND userid="'+user+'")';
                            
                            con.query(sqlk,function(err,rest){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                if(rest.length!=0){
                                    
                                    
                                    socket.emit('grnoti',{'id':rooom,'notification':rest[0].num});
                                }}
                            });

                            
                        });
                    });
                }
            });
            
            console.log('Online Users: '+users);
            users.forEach(function(data){
                console.log('users :'+data);
                if(data!=idofuser){
                
                console.log('user for online excluding me');
                var sql='select id,username from users where  id="'+data+'"';
                var online=new Promise(function(resolve,reject){
                    con.query(sql,function(err,result){
                        socket.emit('fetchonlineusers',result[0]);
                        resolve();
                        
                        
                        
                    
                    });
                });
                online.then(function(){
                    
                    console.log('after resolve items'+items);
                });
            
                
                    
                }
                
            });
            
        }
       

    });
    
    
   
    socket.on('nonuserdata',function(id){
        console.log('nonuser');
        con.query('select id,username from users where id!="4fba0847be33303e9014e979b7573822" AND id NOT IN (select userid from participents where groupid="'+id.id+'")',function(error,rsult){
            if(!error){
                for(i=0;i<rsult.length;i++){
                    console.log(rsult[i]);
                    socket.emit('groupusers',{'iamadmin':false,'admin':false,'member':rsult[i],'join':false}); 
                }
            }
            else{console.log(error);}
        });
    });
    socket.on('joinpubs',function(userdetails){
        qur='insert into participents values("'+userdetails.group+'","'+userdetails.myid+'")';
        console.log(qur);
        con.query(qur,function(err,r){
            if(err){
                console.log('Error in new pub join query :'+err);
            }
            else{
                socket.emit('groupcreated',{'id':userdetails.group,'name':userdetails.name,'status':'pub'});
            }
        });

    });
    socket.on('username',function(id){
        var admin=false;
        var iamadmin=false;
       
        if(id.me==id.admin){
            iamadmin=true;
        }
        if(id.member.userid==id.admin){
            admin=true;
        }
        
        con.query('select id,username from users where id="'+id.member.userid+'"',function(err,rs){
            
            socket.emit('groupusers',{'iamadmin':iamadmin,'admin':admin,'member':rs,'join':true});
        });
    });
    socket.on('addmember',function(info){
        console.log('new member');
        console.log(info);
        quer='select * from groups where id="'+info.groupid+'"';
        con.query(quer,function(errr,result){
            if(errr){console.log('query error :'+errr);}
            if(result.length==1)
            {
                console.log('inside query');
                var users;
                
                if(info.admin=result[0].admin){
                    var members=new Promise(function(resolve,reject){
                        con.query('select userid from participents where groupid="'+info.groupid+'"',function(er,resul){
                            user=resul;
                            console.log('group members:'+user);
                            resolve();
                        });
                    });
                    members.then(function(resolve,reject){
                        console.log('after resolve');
                        for(i=0;i<info.member.length;i++){
                            new Promise(function(resolve,reject){
                                con.query('insert into participents values("'+info.groupid+'","'+info.member[i]+'") ',function(err,res){
                                    if(!err)
                                    {
                                        
                                            for(j=0;j<user.length;j++){
                                                if(user[j] in usersocket){
                                                    
                                                    socket.to(usersocket[user[j]]).emit('newmemberadd',{'name':usernames[user[j]],'groupid':info.groupid});
                                                }
                                            }
                                            
                                        resolve();
                                    }
                                });
                            });
                        }
                    });
                }
            }
        });
    });
    socket.on('removemembers',function(detail){
        
        con.query('select admin from groups where id="'+detail.group+'"',function(err,re){
            if(err){
                console.log(err);
            }
            else{
                
                if(detail.me==re[0].admin){
                    con.query('delete from participents where userid="'+detail.userrem+'" AND groupid="'+detail.group+'"',function(err1,rr){
                        if(!err1){
                            console.log('no error');
                            socket.emit('memberremoved',detail.userrem);
                            socket.to(usersocket[detail.userrem]).emit('youareout',detail.group);
                        }
                        else{
                            console.log('err2'+err1);
                        }
                    });
                }
            }   
        });
    });
    socket.on('groupleft',function(info){
        sql='select admin from groups where id="'+info.groupid+'"';
        new Promise(function(resolve,reject){
            con.query(sql,function(er,resl){
                if(er){console.log(er);}else{
                    if(resl.length==1){
                        if(resl[0].admin==info.myid){
                            con.query('select userid from participents where groupid="'+info.groupid+'" LIMIT 1',function(ee,rr){
                                if(ee){console.log(ee);}
                                else{

                                    con.query('update groups set admin="'+rr[0].userid+'" where id="'+info.groupid+'" ');
                                }
                            });
                        }
                    }
                }
            });
        });
        sql='delete from participents where userid="'+info.myid+'" AND groupid="'+info.groupid+'"';
        con.query(sql,function(err,conf){
            if(err){console.log(err);}
            else{

                socket.emit('groupleftconfirm',info.groupid);
                con.query('select name,status from groups where id="'+info.groupid+'"',function(erro,reso){
                    if(reso[0].status=='pub'){
                        socket.emit('groupspub',{'id':info.groupid,'name':reso[0].name,'status':reso[0].status});

                    }
                      
                });
                
                con.query('select * from participents where groupid="'+info.groupid+'"',function(err,rem){
                    if(rem.length==0)
                    {
                        con.query('delete from groups where id="'+info.groupid+'"');
                    }
                } );
            }
        });
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
        
        
        con.query('select * from chat where id="'+group.group+'" ',function(err,result){
            
            con.query('select name from groups where id="'+group.group+'"',function(err1,res1){
                if(err1){console.log(err1);}else{
                socket.emit('allmessage',{'receiver':res1[0].name,'message':result});
                }
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
                var sql='insert into groups values("'+grid+'","'+group.admin+'","'+group.name+'","'+group.status+'")';
                con.query(sql,function(err,res){
                    con.query('insert into room values("'+grid+'","'+group.admin+'","'+group.admin+'")',function(err,result){
                        
                    });
                    if(!err){console.log('group created: '+group.name);}else{console.log(err);}
                    con.query('insert into participents values("'+grid+'","'+group.myid+'")');
                    
                    for(i=0;i<group.members.length;i++){
                        con.query('insert into userclick(roomid,userid) values("'+grid+'","'+ group.members[i]+'")');
                        con.query('insert into participents values("'+grid+'","'+group.members[i]+'")');
                        socket.to(usersocket[group.members[i]]).emit('groupcreatedbyfriend',{'id':grid,'name':group.name,'status':group.status});
                    }
                    
                    
                    socket.emit('groupcreated',{'id':grid,'name':group.name,'status':group.status});
                });
            }

        });
        
    });
    
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
                        
                    }
                    else{
                        con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+roomid+'" AND userid="'+data.myid+'")');
                    }
                });
                
                
                
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
        
        if(ur.receiver=='4fba0847be33303e9014e979b7573822'){
              
            users.forEach(function(sk){
            socket.to(usersocket[sk]).emit('usertyping',{'room':ur.receiver,'id':ur.receiver,'name':usernames[ur.sender]})
            });

        }
        else{
        con.query('select userid from participents where groupid="'+ur.receiver+'"',function(err,result){
            //console.log('ty:'+result);
            if(result.length>0){
                
                var send=[];
                result.forEach(function(sk) {
                    send.push(sk.userid);
                });
               // console.log('snd:'+send);
                send.forEach(function(skt){
                    socket.to(usersocket[skt]).emit('usertyping',{'room':ur.receiver,'id':ur.receiver,'name':usernames[ur.sender]});
                });

            }
            else{
            //console.log('else');
                socket.to(usersocket[ur.receiver]).emit('usertyping',{'room':ur.receiver,'id':ur.sender,'name':usernames[ur.sender]});
            
        }
        });
    }   
            
           
            
        
    });
    socket.on('update',function(id){
        getroom(id.user,id.frd,function(rrm){
            qr='select * from userclick where roomid="'+rrm+'"';
            con.query(qr,function(err,rst){
                if(rst.length==0){
                    con.query('insert into userclick values("'+rrm+',"'+id.user+'")');

                    
                }
                else{
                    con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+rrm+'" AND userid="'+id.user+'"');
                }
            });
        });
    });
    socket.on('newmessage',function(msg){
        
        if(msg.receiver=='4fba0847be33303e9014e979b7573822'){
            console.log('pub mssge');
            for(i=0;i<users.length;i++){
                
                con.query('insert into chat(id,sender,receiver,massge,time,date) values("94dbe2575d073999956c38753d8bcbef","'+msg.sender+'","4fba0847be33303e9014e979b7573822","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(eeer,dtt){
                    if(eeer){
                        console.log(eeer);
                    }
                });
                if(users[i]!=idofuser){
                    
                    
                    socket.to(usersocket[users[i]]).emit('roommessage',{'id':msg.receiver,'sender':usernames[msg.sender],'textmessage':msg.textmessage});
                }
            }
        }
        else{
            console.log('massge on server' + msg);
            getroom(msg.sender,msg.receiver,function(result){
                con.query('update userclick set time=CURRENT_TIMESTAMP where roomid="'+result+'" AND userid="'+msg.sender+'"');
                if(result==msg.receiver){
                    console.log('group massage');
                    con.query('insert into chat(id,sender,receiver,massge,time,date) values("'+result+'","'+msg.sender+'","'+msg.sender+'","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(err,res){
                        if(err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            console.log('message inserted');
                        }
                    });
                    console.log('sending to users....'); 
                    qur='select userid from participents where groupid="'+result+'" AND userid!="'+msg.sender+'"';
                    con.query(qur,function(err,results){
                        if(err){console.log(err);}
                        else{
                            console.log(results.length +' :user foud');
                            
                            for(i=0;i<results.length;i++){
                                var us=results[i].userid;
                                if(usersocket[us]!=undefined){
                                    socket.to(usersocket[us]).emit('grnoti',{'id':msg.receiver,'notification':1});
                                    socket.to(usersocket[us]).emit('roommessage',{'id':msg.receiver,'sender':usernames[us],'textmessage':msg.textmessage});
                                }
                                else{
                                    console.log('user'+us+ 'is not on socket');
                                }
                            
                            }
                            
                        }
                    });
                }
                else{
                    console.log('user massage');
                    con.query('select username from users where id="'+msg.sender+'"',function(err,res1){
                        
                        socket.to(usersocket[msg.receiver]).emit('newnoti',{'id':msg.sender,'notification':1});
                        socket.to(usersocket[msg.receiver]).emit('roommessage',{'id':msg.sender,'sender':res1[0].username,'textmessage':msg.textmessage});
                        console.log('user massage sent');
                        con.query('insert into chat(id,sender,receiver,massge,time,date) values("'+result+'","'+msg.sender+'","'+msg.receiver+'","'+msg.textmessage+'","'+msg.time+'","'+msg.date+'")',function(err,res){
                            if(err){console.log(err);}
                            else{
                                console.log('insert')
                            }
                   // console.log('inserted at  :'+result);
                        });
                    });
                }
            });
        }
    });
                
        
        

        //socket.to(room).emit('getmessage',msg);
  
    socket.on('groupinfo',function(groupdata){
        
        
        con.query('select * from groups where id="'+groupdata+'"',function(err,result){
           if(result.length!=0){
                var name=result[0].name;
                var admin =result[0].admin;
           
                var sqlq='select userid from participents where groupid="'+groupdata+'"';
                con.query(sqlq,function(err1,result1){
                
                    socket.emit('groupdata',{'id':groupdata,'name':name,'admin':admin,'users':result1});
               
                
                });
            }
        });

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
    socket.on('disconnect',function(){
        console.log('discont');
    });
  

    

   
    


});

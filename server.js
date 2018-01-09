

var express=require('express');

var app = express();

var http = require('http').Server(app);

var io=require('socket.io')(http);

var crypto= require('crypto');

var mysql = require('mysql');

var bodyParser = require('body-parser');

app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

var engines = require('consolidate');

app.set('views', __dirname + '/views');

app.engine('html', engines.mustache);

app.set('view engine', 'html');

app.get('/404', function(req, res, next){
next();
});



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


app.get('/', function(req, res){

    res.render( 'index');

});
app.get('/login', function(req, res){

    res.render('login');

});
app.post('/ChatRoom', function(req, res){
    var userid=req.body.userid;
    var username=req.body.username;
    console.log(userid);
    res.render('chatroom',{'userid':userid,'username':username});

});


var users={};

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

    /*  login process start*/
var login=io.of('/login');
login.on('connection',function(socket){
    var loginuserid;
    var loginusername;
    socket.on('loginDetails',function(details){
        var id=details.email+details.password;
        id=crypto.createHash('md5').update(id).digest('hex');
        var sql='select * from users where id="'+id+'" and email="'+details.email+'" and password="'+details.password+'"';
        //console.log(sql);
        
        /*  login check */
        con.query(sql,function(err,result,fields){
            if(err){
                socket.emit('loginerror',err);
            }
            else if(result.length==0)
            {
                socket.emit('loginerror','User Not Exist');
            }
            else
            {
                
                //console.log(result[0]);
                loginuserid=result[0].id;
                socketuserid=loginuserid;
                loginusername=result[0].username;
                socketusername=loginusername;
                //console.log('user login '+loginusername);
                socket.emit('loginsuccess',{'userid':loginuserid,'username':loginusername});
                var onlineusers='select id,username from users where active=1';
                con.query(onlineusers,function(err,result){
                    if(result.length>0)
                    {
                        socket.emit('onlineusers',result)
                        //console.log('online: ');
                        //console.log(result);
                    }
                })
                var active='update users set active=1 where id="'+loginuserid+'"';
                con.query(active,function(err,result){
                    if(err)
                    {
                        console.log('active user nahi hain'+err);
                    }
                });
               
            }

        });
    });

    /*  socket disconnection */
    socket.on('disconnect',function () {
        if(loginuserid!=null){
            console.log(loginusername,' is disconect');
            var active='update users set active=0 where id="'+loginuserid+'"';
            con.query(active,function(err,result){
                if(err)
                {
                    console.log('active user nahi hain'+err);
                }
            });
        }
   });

});

/* chating process*/
var chat=io.of('/chat');
chat.on('connection',function(socket){
    var username,idofuser;
    socket.on('userconnect',function(user){
        username=user.name;
        idofuser=user.id;
    });




});

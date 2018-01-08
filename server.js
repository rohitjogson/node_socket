

var express=require('express');

var app = express();

var http = require('http').Server(app);

var io=require('socket.io')(http);

var mysql = require('mysql');

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
      console.log("Connected!");
  }
});


app.get('/', function(req, res){

    res.render( 'index');

});
app.get('/login', function(req, res){

    res.render('login');

});
app.get('/ChatRoom', function(req, res){

    res.render('chatroom');

});
var users={};

http.listen(3000, function(){

  console.log('listening on *:3000');

});

io.on('connection',function (socket) {
    var userid=socket.id;
    var massage;
    socket.on('newmessage',function(message){

        socket.broadcast.emit('broadcastmassage',message);

    });

    socket.on('loginDetails',function(details){
        console.log(details);
        if(users[details.username]!=undefined){
            console.log('username exist');
            if(users[details.username].userpass==details.password){

                console.log('passwordmatch');


                    socket.emit('usersuccess',{'username':users[details.username].username});


            }
            else{
                socket.emit('error','Wrong Password');
            }

        }
        else{

            socket.emit('error','User Not Exist');
        }

    });


    socket.on('userDetails',function (msg) {
        if(users[msg.email]==undefined) {

            users[msg.email] = {'userid': userid,'username':msg.username, 'userpass': msg.password};

            console.log('user connected: ', users[msg.email].username);

            socket.emit('addsuccess', 'Thank You ' + users[msg.email].username + 'For Registration now <a href="/login">Login</a>');
        }
        else{
            socket.emit('userExist',{});
        }
    });


   socket.on('disconnect',function () {

       console.log(users[userid],' is disconect');

       console.log(users);

       socket.emit('userremove','Thanks for chatting');

   });

});
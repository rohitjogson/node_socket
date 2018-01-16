
var user;
var userid='<%= id %>';
var socket=io('/chat');

socket.emit('userconnect',userid);

socket.on('usernamefetch',function(username){
    user=username;
    $('#username').text(username);
});
/* logout*/
$(document).on('click','#logout',function(){
    
    socket.emit('logout',userid);
});
socket.on('logoutsucc',function(data){
    window.location.href=data;
});

/* check for login*/
socket.on('usernahihain',function(){
    window.location.href='/login';
});

/* broadcast */
$(document).on('click','#chatuser li',function(){

    $this= $(this);
    $this.find('.badge-danger').html('');
    var rm=$this.parent('ul').children('.active');
    var rm1=$('.on').parent('ul').children('.active');
    rm.removeClass('active');
    rm.find('a').css({'color':'blue'});
    rm1.removeClass('active');
    rm1.find('a').css({'color':'blue'});
    
    $('.hidden').attr('id',this.id);
    $this.addClass('active');
    $this.find('a').css({'color':'#FFF'});
    $('#unique').html('');
    
    socket.emit('joingroupRoom',{'group':this.id,'myid':userid});
    
});
socket.on('groupcreated',function(grd){
    $("[data-dismiss=modal]").trigger({ type: "click" });
    $('#chatuser').append('<li class="list-group-item " id="'+grd.id+'"><div >'+
            '<a href="#" style="text-decoration: none;text-transform: uppercase">'+
                    grd.name+
                    '<div style="float:right"><span class="badge badge-danger" ></span></div>'+
            '</a>'+
        '</div>'+
        '</li>');

});
socket.on('groupcreatedbyfriend',function(grd){
    alert('you are added in '+grd.name);
    $('#chatuser').append('<li class="list-group-item " id="'+grd.id+'"><div >'+
            '<a href="#" style="text-decoration: none;text-transform: uppercase">'+
                    grd.name+
                    '<div style="float:right"><span class="badge badge-danger" ></span></div>'+
            '</a>'+
        '</div>'+
        '</li>');

});

socket.on('grnoti',function(gr){
    console.log('called');
    if(gr.notification<1){
        if(gr.notification==0){
            $('#chatuser').find('#'+gr.id).find('.badge-danger').html('');
        }
        else{
            $('#chatuser').find('#'+gr.id).find('.badge-danger').html(gr.notification)
        }
    }
    else{
        $('#chatuser').find('#'+gr.id).find('.badge-danger').html(Number($('#chatuser').find('#'+gr.id).find('.badge-danger').html())+Number(gr.notification));
    }
});
socket.on('newuserremovesuccess',function(id){
    
    $('#onlineusers').find('#'+id).remove();
});
socket.on('newuseraddsuccess',function(user){
    socket.emit('mynotification',{'me':userid,'friend':user[0].id});
    if(user[0].id==userid){
        alert('someone login to your account from another device');
        return false;
    }
    $('#onlineusers').find('#'+user[0].id).remove();
    
    $('#onlineusers').append('<li class="list-group-item on " id="'+user[0].id+'"><div >'+
            '<a href="#" style="text-decoration: none;text-transform: uppercase">'+
                    user[0].username+
                    '<div style="float:right"><span class="badge badge-danger" ></span></div>'+
            '</a>'+
        '</div>'+
        '</li>');
                    });
/*get online users */
socket.on('fetchonlineusers',function(data){
    
    
    for(i=0;i<data.length;i++){
        socket.emit('mynotification',{'me':userid,'friend':data[i].id});
        $('#onlineusers').append('<li class="list-group-item on " id="'+data[i].id+'">'+
                    '<div >'+
                        '<a href="#" style="text-decoration: none;text-transform: uppercase">'+
                            data[i].username+
                            '<div style="float:right"><span class="badge badge-danger" ></span></div>'+
                        '</a>'+
                    '</div>'+
                    '</li>');
                        }
                    
    
});
socket.on('yournotification',function(dt){
    
   
    var usr=$('#onlineusers').children('li#'+dt.id);
    
  
   
    
    if(dt.notification>0){
        
       
        
        usr.find('div a div .badge-danger').html(dt.notification);
        
        
    }
    else{
         usr.find('div a div .badge-danger').html('');
        }
        
    
});

socket.on('newnoti',function(usrs){
    if(usrs.id==$('input[type="hidden"]').attr('id')){
        socket.emit('update',{'user':userid,'frd':usrs.id});
        return false
    }
    console.log(usrs.id);
    console.log($('#onlineusers').html());
    console.log(usrs.notification+' new notification');
    var usr=$('#onlineusers').children('#'+usrs.id);
    var value=usr.find('.badge-danger').html();
    console.log(value);
    if(value==''){
        usr.find('.badge-danger').text(usrs.notification);
    }
    else{
        usr.find('.badge-danger').text(Number(value)+Number(usrs.notification));
    }
});

socket.on('userlist',function(data){
    for(i=0;i<data.length;i++){
        if(data[i].id!=userid){
        $('#groups').append('<li class="list-group-item" id="'+data[i].id+'" style="text-transform:capitalize">'+data[i].username+'</li>');
        }
    }
});

$("#creategroups").click(function(){
    var favorite = [];
    $.each($("input[type='checkbox']:checked"), function(){            
        favorite.push($(this).parent('li').attr('id'));
    });
    socket.emit('newgroupcreate',{'admin':userid,'name':$('#groupname').val(),'members':favorite,'myid':userid});
});

socket.on('alreadyhavegroup',function(){
    alert('you already craete group with this name ');
    $('#groupname').val('');
});



$(document).on('click','.on',function(){
    $this= $(this);
    $this.find('.badge-danger').html('');
    var rm=$this.parent('ul').children('.active');
    rm.removeClass('active');
    rm.find('a').css({'color':'blue'});
    var rm1=$('#chatuser').children('.active');
    rm1.removeClass('active');
    rm1.find('a').css({'color':'blue'});
    $('.hidden').attr('id',this.id);
    $this.addClass('active');
    $this.find('a').css({'color':'#FFF'});
    $('#unique').html('');
    
    socket.emit('joinRoom',{'myid':userid,'friendid':this.id});
    socket.emit('massagerequired',{'myid':userid,'friendid':this.id});
});

socket.on('allmessage',function(data){
    console.log('hello all message called');
    var frid=$('.hidden').attr('id');

    for(i=0;i<data.message.length;i++)
    {
        if(data.message[i].sender==userid)
        {
            
            insertChat2('me',user,data.message[i].massge,data.message[i].time,data.message[i].date);
        }
        else
        {
            insertChat2('you',data.receiver,data.message[i].massge,data.message[i].time,data.message[i].date);
        }
    }
    $("#receivername").html(data.receiver);
    $("#unique").animate({ scrollTop:5000});
});
socket.on('naya',function(msg){


    $("#unique").animate({ scrollTop:5000});
    insertChat("you",'SERVER',msg);

});
socket.on('roommessage',function(msg){

    var bruser=msg.sender;
    var mssg=msg.textmessage;
    var rm= $('#unique').find('.typing');
    rm.remove();
    $("#unique").animate({ scrollTop:5000});
    insertChat("you",bruser,mssg);

});

socket.on('usertyping',function(name){
    
    
    if($('input[type="hidden"]').attr('id')==name.id ||$('input[type="hidden"]').attr('id')==name.room||name.room=='94dbe2575d073999956c38753d8bcbef' ){
        
        var rm= $('#unique').find('#'+name.id);
        if(rm){
        rm.remove();
        }
        $('#unique').append('<li style="width:60%;float:left;margin-top:10px;padding:1px" class="typing" id="'+name.id+'">' +
                        '<div style="color:green">' +
                            '<div >' +
                                '<p>'+name.name+ ' is typing....</p>' +
                               
                            '</div>' +
                       
            '</div></li>');
    }
    else{

        var ms=$('ul #onlineuser').find('#'+name.id)
        ms.append('<div id="typing"><center>typing...</center></div>');
    }
    $("#unique").animate({ scrollTop:5000});
    
});


$(document).on("keyup",".mytext", function(e){


    var friendid=$('input[type="hidden"]').attr('id');
    if (e.which == 13){
    
        
        var text = $(this).val();
        $this=$(this);
        
        console.log(friendid);
        if (text !== ""){

            $("#unique").animate({ scrollTop:5000});
            var date = formatAMPM(new Date());
            var day=  formatedate(new Date());
        
            console.log(friendid);
            insertChat("me",user,text);
            socket.emit('newmessage',{'sender':userid,'receiver':friendid,'textmessage':text,'time':date,'date':day});

            $this.val('');

        }
    }
    else{
        socket.emit('typing',{'sender':userid,'receiver':friendid});
    }

});


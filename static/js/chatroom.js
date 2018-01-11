
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
function formatedate(date){

    var mdate=date.getDate();
    var month=date.getMonth();
    var year=date.getFullYear();

    month=month?month:1;
    var fdate=mdate+'/'+month+'/'+year;
    return fdate

}

function insertChat2(who,username,text,day,date,time = 0){
    var control = "";
    


    if (who == "you"){

        control = '<li style="width:60%;float:left">' +
                        '<div class="msj macro">' +

                            '<div class="ctext ctext-r">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>'+date+'  '+day+'</small></p>'+


                            '</div>' +
                            
                    '</div></li>';
    }

    else{
        control = '<li style="width:60%;float:right" class="badge">' +
                        '<div class="msj-rta macro">' +
                            '<div class="ctext ctext-l" style="padding:5px">' +
                                '<p>'+text +
                                '<small>'+date+'  '+day+'</small></p>' +
                            '</div>' +
                        
            '</div></li>';
    }
    setTimeout(
        function(){
            $("#unique").append(control);



        }, time);

}
function insertChat(who,username,text, time = 0){
    var control = "";
    var date = formatAMPM(new Date());
    var day=  formatedate(new Date());


    if (who == "you"){

        control = '<li style="width:60%;float:left">' +
                        '<div class="msj macro">' +

                            '<div class="ctext ctext-r">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>'+date+'  '+day+'</small></p>'+


                            '</div>' +
                            
                    '</div></li>';
    }

    else{
        control = '<li style="width:60%;float:right">' +
                        '<div class="msj-rta macro">' +
                            '<div class="ctext ctext-l">' +
                                '<p>'+text+'</p>' +
                                '<p><small>'+date+'  '+day+'</small></p>' +
                            '</div>' +
                       
            '</div></li>';
    }
    setTimeout(
        function(){
            $("#unique").append(control);



        }, time);

}

function resetChat(){
    $("#unique").empty();


}






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
setTimeout(function(){
    $('.list-group.checked-list-box .list-group-item').each(function () {
        
        // Settings
        var $widget = $(this),
            $checkbox = $('<input type="checkbox" class="hidden" style="display:none" />'),
            color = ($widget.data('color') ? $widget.data('color') : "primary"),
            style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
            settings = {
                on: {
                    icon: 'glyphicon glyphicon-check'
                },
                off: {
                    icon: 'glyphicon glyphicon-unchecked'
                }
            };
            
        $widget.css('cursor', 'pointer')
        $widget.append($checkbox);

        // Event Handlers
        $widget.on('click', function () {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();
        });
        $checkbox.on('change', function () {
            updateDisplay();
        });
          

        // Actions
        function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
                $widget.addClass(style + color + ' active');
            } else {
                $widget.removeClass(style + color + ' active');
            }
        }

        // Initialization
        function init() {
            
            if ($widget.data('checked') == true) {
                $checkbox.prop('checked', !$checkbox.is(':checked'));
            }
            
            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
                $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
            }
        }
        init();
    });
    
    $('#get-checked-data').on('click', function(event) {
        event.preventDefault(); 
        var checkedItems = {}, counter = 0;
        $("#check-list-box li.active").each(function(idx, li) {
            checkedItems[counter] = $(li).text();
            counter++;
        });
        $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
    });
}, 2000);





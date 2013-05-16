
var colors = {
    etusivu:[0,0,0,0.8],
    ulkomaat:[0,0,0,0.8],
    uutiset:[0,105,153,0.8],
    kulttuuri:[228,23,93,0.8],
    urheilu:[90,55,120,0.8],
    artikkeli:[0,136,130,0.8],
    teema:[0,136,130,0.8],
    defaultColor:[0,0,0,0.8],

    'etusivu':[147,186,122,0.7],
    'ulkomaat':[81, 135, 182, 1],
    'kulttuuri':[219,101,49,0.7],
    'urheilu':[91,195,89,0.7],
    urheilu:[40, 162, 98, 0.7],
    'teema':[198,45,67,0.7],
    talous:[72, 162, 192, 0.7],
    mielipide:[176, 192, 91, 0.7],
    uutiset:[91, 109, 207, 0.7],

    getBackground:function(name,opacity){
        return 'background-color:'+colors.getColor(name,opacity);
    },
    getColor:function(name,alpha){
       if (name){    
            name = name.toLowerCase();
            if (this[name]){    
                if (alpha){
                    return 'rgba('+this[name][0]+','+this[name][1]+','+this[name][2]+','+alpha+')';
                } else {                
                    return 'rgba('+this[name].join(',') +')';
                }
            } else {
                return 'rgba('+this.defaultColor.join(',') +')';
            }
       }
    }
}

$.fn.extend({

    _getPosition:function(){
        return {
            top:parseFloat( this.attr('translate-y') ),
            left:parseFloat( this.attr('translate-x') ),
            unit:this.attr('translate-units')
        }
    },
    
    // makes functionality for each jquery element for translate command, prefixes are defined in prefix array
    // only translates in relative coordinates
    //
    // uses translate-y and translate-x attributes for returning the current position
    // also translate-units attribute is used, for easily read the units for translation,
    // for example px or %

    _translate:function(x,y,units){
        var prefix = ['moz','o','ms','webkit'];

        if (!units){
            units = 'px';
        }
        
        for (var i in prefix){
            this.css('-'+prefix[i]+'-transform','translate3d('+x+units+','+y+units+',0px)');
        }

        this.attr('translate-x',x).attr('translate-y',y).attr('translate-units',units);
        return this;
    }
});

function getId() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function isInArray(array,value){
    var found =false;
    for (var i in array){
        if (array[i] == value){
            found = true;
        }
    }
    return found;
}

function getItem(array,key,value){
    for (var i in array){
        if (key && value){
            if(array[i]){            
                if (array[i][key] == value){
                    return array[i];
                }
            }        
        } else if(key){

            if (array[ı] == key){
                return array[ı];
            }
        }
    }
}
function getItemDate(timestamp){
    var dt = new Date(timestamp*1000);

    var str = dt.getDate() +'.'+ (dt.getMonth()+1) +'.'+dt.getFullYear() +'  '+dt.getHours() +':'+dt.getMinutes();
    return str;
}

function each(arr,fn){
    if (arr instanceof Array){    
        for (var i in arr){
            fn(arr[i],i);
        }
    } else {
        fn(arr,0);
    }
}


var dateParser = {
    strangeDate:{
        getMonth:function(dateString){
            return dateString.split('.')[2];
        },
        getYear:function(dateString){
            return dateString.split('.')[1];    
        },
        getDay:function(dateString){
            return dateString.split('.')[0];    
        }
    },

    getYear:function(dateString){
        return dateString.split('.')[2];
    },
    getMonth:function(dateString){
        return dateString.split('.')[1];
    },
    getDay:function(dateString){
        return dateString.split('.')[0];
    },

    convert:function(strangeDate){
        if (strangeDate){
            return strangeDate.split('.')[2] +'.'+ strangeDate.split('.')[1] +'.'+strangeDate.split('.')[0];
        } else {
            return strangeDate;
        }
    }
} 

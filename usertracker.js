function userTracker(_rupu){
	var me = this;
	this._rupu = _rupu;	
	this.bind();

	
	this._db = new ajaxQueue({url:'usertracker.php',dataType:'json',type:'POST'});
	
	this._userData = {
		'user_id':false,
		'session_id':getId(),
		'start_time':Date.now(),
		'window':[window.innerWidth,window.innerHeight],
		'screen':[window.screen.width,window.screen.height],
		'media':window.styleMedia.type,
		'type':navigator.userAgent,
		'vendor':navigator.vendor
	}

	this._form = $([
		'<div id="usertracker-login">',	
			'<div id="usertracker-login-input-container">',
				'<input type="text" id="username" placeholder="username"></input>',
				'<button>ok</button>',
			'</div>',
		'</div>'
	].join(''));

	this._info = $( [
		'<div id="usertracker">',
			'<h3></h3>',
			'<span>tracking</span>',
		'</div>'
		].join('') );

	this._location = [0,0];	
	
	this._form.find('#username').focusout(function(){
		me._hideForm();
		me.setUser();
	}).keyup(function(e){
		if (e.keyCode == 13){
			me._hideForm();
			me.setUser();				
		}
	});
	this._info.hammer().on('tap',function(){
		me._showForm();
	});

	
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(e){
			me._userData.latitude = e.coords.latitude;
			me._userData.longitude = e.coords.longitude;
			me._getSession();
		});
	} else {
		me._getSession();
	}
}

userTracker.prototype = {
	visibleitem:false,
	pane:false,
	_showTracker:function(){
		$('#wrapper').append(this._info);
		
		var me = this;
		this._form.find('#username').val(this._userData.user_id).focus(); 
	},
	_hideTracker:function(){
		this._info.remove();
	},
	_showForm:function(){
		$('#wrapper').append(this._form);
	},
	_getUsername:function(){
		return this._form.find('#username').val();
	},
	_hideForm:function(){
		this._form.css('display','none');
	},
	_getData:function(data,_callback){
		$.ajax({
			url:'usertracker.php',
			dataType:'json',
			data:data,
			type:'POST',
			success:_callback,
			error:_callback
		});
	},
	_getSession:function(_callback){
		var me = this;
		this._getData({
			chklogin:true,
		},function(e){
			if (e.ok == true){
				me._userData.user_id = e.data.user_id;
				me._showTracker();
				me._info.find('h3').text(me._userData.user_id);
			} else {
				me._showForm();
			}
		})
	},
	setUser:function(){
		var me = this;

		this._getData({
			login:me._getUsername(),
			userdata:me._userData
		},function(e){
			if (e.ok == true || e.ok == 'true'){
				me._userData.user_id = me._getUsername();
				me._info.find('h3').text(me._userData.user_id);
				me._showTracker();
			} else {
				me._showForm();
			}
		});
		/*
		if (!localStorage.getItem('rupu_id')){
			localStorage.setItem('rupu_id',getId());
		}
		this._userId = localStorage.getItem('rupu_id');
		localStorage.setItem('rupu_id',this._userId);
		*/
	},
	bind:function(rupu){
		var me = this;
		if (rupu) this._rupu = rupu;
		this._rupu.on('tracker',function(e){
			e.time = Date.now();
			e.user_id = me._userData.user_id;
			e.session_id = me._userData.session_id;
			me._db.add({data:e});
		});
	}
}

function ajaxQueue(args,oncomplete){	
	this._args = args;
	this._reqs = [];
	this._result = [];
	this._busy = false;
	this._callback = oncomplete || function(){};
}

ajaxQueue.prototype = {
	add:function(data){
		this._reqs.push(data);
		this._ready();
	},
	_error:function(e){
		if (typeof(this.onError)=='function'){
			this.onError(e);
		} else if (e.responseText){
			console.log(e.responseText);			
		} else console.log(e);
	},
	_ready:function(e){
		if (this._reqs.length > 0 && !this._busy){
			this._send(this._reqs.shift());
		} else if (this._reqs.length == 0){			
			this._callback.call(this, this._result);
			this._result = [];
		}
	},
	_send:function(data){
		var me = this;
		this._busy = true;
console.log(data)
		$.ajax({
			url:this._args.url,
			dataType:this._args.dataType,
			type:this._args.type,
			data:data,
			success:function(e){
				me._busy = false;				
				if (e.ok == true || e.ok == 'true'){
					me._result.push(e);
					me._ready();
				} else {
					me._error(e);
				}
			},
			error:function(e){
				me._busy = false;
				me._error(e);
				me._ready();
			}
		});
	}
}

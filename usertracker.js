function userTracker(_rupu){
	this._rupu = _rupu;	
	this._data = [];
	this._buffer = 10;

	this.bind();

	this.setUser();
	
	this._userData = {
		'window':[window.innerWidth,	window.innerHeight],
		'screen':[window.screen.width,window.screen.height],
		'media':window.styleMedia.type,
		'type':navigator.userAgent,
		'vendor':navigator.vendor
	}

	this._lastSentCounter = 0;
}

userTracker.prototype = {
	visibleitem:false,
	pane:false,
	setUser:function(){
		if (!localStorage.getItem('rupu_id')){
			localStorage.setItem('rupu_id',getId());
		}

		this._userId = localStorage.getItem('rupu_id');
	},
	bind:function(){
		var me = this;
		
		this._rupu.on('all',function(e,d){
			console.log(e,d);
			if (me[e]) me[e](d);
		});
	}
}
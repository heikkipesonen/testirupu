var rupu = function(){
	// iscroll common options
	this.iscrollOpts = {
		hScrollbar:true,
		vScrollbar:true,
		fadeScrollbar:true,
		hideScrollbar:true,
		lockDirection:true
	}

	this.mainScrollOpts = {
		snap:'.pane',
		momentum:false,
		vScrollbar:false,
		hScrollbar:false,
		SnapThreshold:500,
		lockDirection:true
	}


	// elements for rupu to use
	this.panes = {	
		left : $('<div id="left-pane" class="pane"></div>'),
		right : $('<div id="right-pane" class="pane"></div>'),
		main : $('<div id="main-pane" class="pane"></div>'),
		main_scroller : $('<div id="main-pane-scroller"></div>'),
		main_content : $('<div id="main-pane-content"></div>'),
		container : $('<div id="main"></div>'),		
	}

	this._mainScroll = false; // iscroll for main element, the horizontal scroller
	this._pageScroll=false;	// page, item display scroller
	this._mainPaneScroll=false;	// main pane, the tile display scroll
	//this._listScroll=false;
	this.tools = {};		// toolbar
	this._listeners =[]; // event listeners registered for rupu

}

rupu.prototype = {
	// start rupu
	// container is the element for rupu run in
	start:function(container){
		var me = this;

		this._dummy = $('<div id="dummy" />');
		this._items = [];
		this.tools = new toolbar('toolbar');

		this.panes.container
				.append(this.panes.left.append(this.panes.left_newscontainer))
				.append(this.panes.main.append(this.panes.main_content))
				.append(this.panes.right);
				
		$(container).append(this.panes.container);

		this._container = $(container);

		this.panes.container.css({
			position:'absolute',
			left:'0px',
			top:'0px'
		});

		this.panes.container._translate(0,0);

		this.panes.left.hammer().on('tap',function(){
			me._showPane('main-pane');
			me._fire('hideItem');
		});

		this._lastEvent = false;
		this.panes.container.on('mousedown',function(e){
			me._lastEvent = false;
		});


		this.panes.container.hammer().on('touchstart',function(e){
			me._lastEvent = false;
		});

		this.panes.container.hammer().on('dragleft dragright',function(e){
			var dist = 0;

			if (me._lastEvent){
				dist = e.gesture.deltaX- me._lastEvent.gesture.deltaX;
			}
			me._drag(dist);
			me._lastEvent = e;
		});

		this.panes.container.hammer().on('touchend',function(e){
			me._checkPosition();
		});

		this.panes.container.on('mouseup',function(e){
			me._checkPosition();
		});

		this.tools.setSize(['100%','100%'])
		this.panes.right.append( this.tools.getElement() );	
		this.overlay(true);
		
		this.on('load',function(){
			me._setMenu();
			me._sortItems();
			me._showPane('main-pane');
			me
		});

		$(window).resize(function(){
			me.overlay(true);
			clearTimeout(me._onscale);

			me._onscale = setTimeout(function(){
				
				me.scale();
				me.overlay(false);
			},200);
		});

		this._showPane('main-pane',0);
		this._setMenu();
		this._fire('start');	
		this.scale();

		this._getData();
	},
	overlay:function(show){
		var me = this;
		if (!this._overlay){
			this._overlay= $([
				'<div id="overlay">',
				'<h1 class="main-title">rupu 0.1</h1>',
 				'<h3 class="sub-title">Metropolia / Heikki Pesonen / 2013</h3>',
				'</div>'
			].join('')).css({
				position:'fixed',
				top:'0px',
				left:'0px',
				width:'100%',
				height:'100%',
				opacity:'0'
			});
		}

		if (show){
			if (!this._hasOverlay){
				this._container.append(this._overlay);
				this._hasOverlay = true;
				this._overlay.animate({
					opacity:1,
				},500);
			}

		} else {
			if (this._overlay){
				this._overlay.animate({
					opacity:0,
				},500,function(){
					me._hasOverlay = false;
					me._overlay.remove();
				})
			}
		}
	},
	error:function(e){
		console.log(e.stack);

		this.overlay(true);
		this._overlay.append('<h3 class="error">something is not quite right just now. try again later :(</h3>')
	},
	getVisibleItem:function(){
		return this.panes.left.find('#page').attr('data-item');
	},
	// percentage values for window sizes
	_getWidth:function(pc){
		return pc[0]* (window.innerWidth/100)
	},
	_getHeight:function(pc){
		return pc[1]* (window.innerHeight/100)
	},
	useBigImage:function(){
		if (window.innerWidth > 900){
			return true;
		} else {
			return false;
		}
	},
	// scale the elements according to screen size changes
	scale:function() {		
		var me = this;
		this.panes.container._translate(0,0);
		//this.hideTopMenu(null,true);
		var topOffset = 0;//64;///this.panes.top.height();

		this._container.css({
			top:topOffset,
			height:window.innerHeight-topOffset
		})

		this.panes.left.css({
			top:0,
			left:0,
			width:window.innerWidth > 700 ? (window.innerWidth*0.5 < 700 ? 700 : window.innerWidth*0.5) :  (window.innerWidth > 1000 ? 1000 : window.innerWidth)
		});

		this.panes.main.css({
			width:window.innerWidth,
			left:this.panes.left.width(),
			height:window.innerHeight - topOffset,
			top:0
		});

		this.panes.right.css({
			left:this.panes.left.width() + this.panes.main.width(),
			top:0
		});

		this.panes.container.css({
			width: this.panes.left.width() + this.panes.main.width() + this.panes.right.width()
		});


		this._leftPos = 0;
		this._mainPos = -this.panes.left.outerWidth(true);
		this._rightPos = -(this.panes.left.outerWidth(true) + this.panes.right.outerWidth(true));

		

		try{
			this._scrollRefresh();
			this._tile();
			this.tools.scaleHeight();

		} catch (e){
			this.error(e);
		}		
		this._fire('scale');

	},
	_animate:function(distance,time){	
		var lastStep = 0,
		me = this;
		if (!time) time = 200;

		this._dummy.stop();
		this._dummy.css('width','100px');

		this._dummy.animate({
			width:0
		},{
			step:function(step){
				var cdist = (step-100) * (distance/100);					
				me._drag( -(cdist-lastStep) );
				
				lastStep = cdist;

			},
			duration:time
		});
	},
	_drag:function(distance){
		var pos = this.panes.container._getPosition().left;
		this.panes.container._translate(pos+distance,0);		
	},
	_checkPosition:function(){

		var position = this.panes.container._getPosition().left,

			diffToMain = this._mainPos-position,
			diffToRight = this._rightPos-position,
			diffToLeft = this._leftPos-position;

		
		var panToright = Math.abs( diffToRight )< (this.panes.right.outerWidth(true)/2) ? true : position < this._rightPos;
		var panToLeft = Math.abs( diffToLeft ) < (this.panes.left.outerWidth(true)/2) ? true : position > this._leftPos;

		if (panToright){
			this._showPane('right-pane');
		} else if (panToLeft){
			this._showPane('left-pane');
		} else {
			this._showPane('main-pane');
		}

		if (this._lastEvent){
			if (this._lastEvent.gesture.velocityX > 2.5){
				if (this._lastEvent.gesture.direction == 'left'){
					this._showPane('right-pane');
				} else if (this._lastEvent.gesture.direction == 'right'){
					this._showPane('left-pane');
				}
			}
		}
	},
	// scroll to certain pane with _mainScroll-horizontal scroll
	_showPane:function(id,time){
		if (time==undefined){
			time=300;
		}
		var position = 0;
		if (id == 'main-pane'){
			position = -this.panes.left.outerWidth(true);
		} else if (id == 'left-pane'){
			if (this.panes.left.children().length > 0){			
				position = 0;
			} else {
				this._showPane('main-pane');
				return;
			}
		} else if (id == 'right-pane'){
			position = -(this.panes.left.outerWidth(true) + this.panes.right.outerWidth(true));
		}
		
		//this.panes.container._translate(position,0);
		var diff = -this.panes.container._getPosition().left + position;
		this._animate(diff);
	},
	// test news item size
	_testSize:function(item){
		if (item.hasClass('smallListItem')){
			return 's';
		} else {
			return 'b';
		}
	},
	_sortSet:function(items){
		items.sort(function(a,b){
			if (a.priority && b.priority){
				return a.priority - b.priority;
			} else {
				return 0;
			}
		})
	},
	// show category of items by category name
	showItems:function(items){
		var me = this;				
		var e = [];

		this._sortSet(items);
		
		each(items,function(item){
			e.push(item.getTile());
		});
		

		this._showAtPane(e);
		this._fire('showItems',items);
	},
	showAll:function(){
		this.showItems(this._news.getItems());
		this._showPane('main-pane');
	},
	showCategory:function(cat){
		this.tools.selectButton(cat);
		var items = this.getCategory(cat);
		this._container.css('background-color',colors.getColor(cat,1));
		this.showItems(items);
		
		this._fire('showCategory',cat);		
	},
	// show news item in left pane display
	showItem:function(id,scrollTo){
		var me = this;
		var container = this.panes.left;
		
		if (container.find('[data-item="'+id+'"]').length > 0){
			if (scrollTo!=false){
				me._showPane('left-pane');
			}
		} else {
			var e = this._getItem(id).getFull();

			container.transit({
				opacity:0,
			},200,function(){
				container.html(e);
				if (scrollTo!=false){
					me._showPane('left-pane');
				}

				if (me._pageScroll){
					me._pageScroll.destroy();
				}

				container.transit({opacity:1});
				me._pageScroll = new iScroll('page',this.iscrollOpts);
				me._fire('showItem',id);
			});
		}
	},
	_scrollRefresh:function(){
		if (this._mainPaneScroll && this._mainPaneScroll!=undefined){
			this._mainPaneScroll.destroy();
		}
		
		this._mainPaneScroll = new iScroll('main-pane',this.iscrollOpts);						
	},
	_tile:function(callback){
		var container = this.panes.main_content;
		var me = this;		
		
		container.freetile({
			containerResize:false,
			animate:false,
			callback:function(){
				me._scrollRefresh();
				me._showPane('main-pane');

				container.transit({
					opacity:1
				},300,function(){
					//me._fire('pageChangeReady');
					if (typeof(callback) == 'function'){
						callback();
					}
					me._fire('pageReady');
				});
			}
		});

	},
	_showAtPane:function(content){
		var container = this.panes.main_content;
		var me = this;
		
		this._fire('pageChangeStart');
		//this._showOverlay();

		container.transit({
			opacity:0
		},200,function(){

			container.empty();
		
			each(content,function(item){
				item.hammer().on('tap',function(){
					me.showItem($(this).attr('id'));
				});
				container.append(item);

			});

			me._tile();

		})
	},
	_setMenu:function(){
		var me = this;
		var categories = this._getCategoryNames();		
		me.tools.reset();
		each(categories,function(catg){
				catg = catg.toLowerCase();
				me.tools.addButton({
						text:catg,
						id:catg,
						span:me.getCategory(catg).length,
						bg:colors.getColor(catg,1),
						spancolor:[250,250,250,0.4],
						action:function(id){
							me.showCategory(id);
						},
						target:catg.name
				});
		});
	
		me.scale();		
	},
	_sortItems:function(){
		this._news.sort(function(a,b){
			if (a.category > b.category){
				return 1;
			} else {
				return -1;
			}
		});
	},
	_sortItems:function(){
		this._items.sort(function(a,b){
			return a.priority - b.priority;
		});
	},
	_getCategories:function(){
		var categories = {};
		for (var i in this._items){
			if (categories[this._items[i].category]){
				categories[this._items[i].category]++;
			} else {
				categories[this._items[i].category] = 1;
			}
		}

		this._categories = categories;
		return categories;
	},
	_getCategoryNames:function(){		
		this._getCategories();
		var result = [];
		for (var i in this._categories){
			result.push(i);
		}
		return result;
	},
	getCategory:function(name){
		var result = [];
		name = name.toLowerCase();
		for (var i in this._items){
			if (this._items[i].category.toLowerCase() == name){
				result.push(this._items[i]);
			}
		}
		return result;
	},
	_getData:function(){
		var me = this;		
			$.ajax({
				url:'http://ereading.metropolia.fi/testirupu/parser.php',
				
				success:function(e){
					var rs = e;
				
					if (rs.status == 'ok'){
						for (var i in rs.data){
							me._items.push( new newsitem(rs.data[i]));
						}								
						me._getCategories();
						me._fire('load',me._items);
					} else {
						me.error(e);
					}
				},
				error:function(e){
					me.error(e);
				}
			});
	},
	_getItem:function(id){
		var found = false;
		for (var i in this._items){
			if (this._items[i]._id == id){
				found = this._items[i];
				break;
			}
		}

		return found;
	},	

	on:function(name,fn){		
		if (this._listeners[name] == undefined){
			this._listeners[name] = Array();
		}	
		this._listeners[name].push(fn);		
	},
	_fire : function(evt,data,e){		
		for (var i in this._listeners['all']){			
			if (this._listeners['all'][i]!=undefined && typeof(this._listeners['all'][i])== 'function'){						
				this._listeners['all'][i](evt,data,e);
			}
		}
		if (this._listeners[evt]!=undefined){
			for (var i in this._listeners[evt]){
				if (typeof(this._listeners[evt][i])=='function'){
					this._listeners[evt][i](data,e);
				}
			}			
		}
	},
	off:function(evt){
		delete this._listeners[evt];
	}	
}

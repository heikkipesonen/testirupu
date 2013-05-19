var rupu = function(){
	// iscroll common options
	this.iscrollOpts = {
		momentum:true,
		vScrollbar:false,
		hScrollbar:false,
		SnapThreshold:500,
		lockDirection:true		
		/*
		hScrollbar:true,
		vScrollbar:true,
		fadeScrollbar:true,
		hideScrollbar:true,
		lockDirection:true
		*/
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
		brand: $('<div id="brand-display"></div>'),
		top: $('<div id="top-bar"></div>'),
		left : $('<div id="left-pane" class="pane"></div>'),
		right : $('<div id="right-pane" class="pane"></div>'),
		main : $('<div id="main-pane" class="pane"></div>'),
		main_scroller : $('<div id="main-pane-scroller"></div>'),
		main_content : $('<div id="main-pane-content"></div>'),
		container : $('<div id="main"></div>')
	}

	this._mainScroll = false; // iscroll for main element, the horizontal scroller
	this._pageScroll=false;	// page, item display scroller
	this._mainPaneScroll=false;	// main pane, the tile display scroll
	//this._listScroll=false;
	this.tools = {};		// toolbar
	this._listeners =[]; // event listeners registered for rupu

}

rupu.prototype = {
	showCategories:function(){
		if (this._loaded){
			var list = this._getCategoryNames(),
				e = [];

			var brand = $([
					'<div id="brand-display">',
						'<h2>',this._source.title,'</h2>',
						//'<img src="',this._source.image.url,'" alt="" />',
					,'</div>'

			].join(''));

			e.push(brand);

			for (var i in list){
				if (list[i]){
					var items =this.getCategory(list[i]);
					this._sortSet(items);

					var img = '';

					for (var v in items){
						if (items[v].hasImage()){
							img = items[v].getImage();
							break;
						}
					}

					
					
					var c = $('<div id="'+list[i]+'" class="category tile"><img src="'+img+'" alt="" /><h4 style="background-color:'+colors.getColor(list[i],0.7)+'">'+list[i]+'</h4></div>')
					

					c.css({
						'background-color':colors.getColor(list[i]),
						width:this._itemWidth,
						height:this._itemWidth,
					})
					e.push(c);

				}
			}

			
			this._container.css('background-color',colors.getColor('categories',1));
			this._showAtPane(e);
			this._tile();
		}
	},
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
			
			me._fire('hideItem',me.getVisibleItem());
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
		this.panes.right.css({
			width:'148px'			
		})
		this.panes.right.append( this.tools.getElement() );	
		this.overlay(true);
		
		this.on('load',function(){
			me._loaded = true;
			me._setMenu();
			me._showPane('main-pane');
			me.showCategories();
			//me.showCategory('etusivu');
			//me.showItems( me._makeFrontPage() );
			me.overlay();
		});

		$(window).resize(function(){
			me.overlay(true);
			clearTimeout(me._onscale);

			me._onscale = setTimeout(function(){				
				me.scale();
				me.overlay(false);

				me._fire('resize',[window.innerWidth,window.innerHeight]);
			},200);
		});

		this._showPane('main-pane',0);
		this._setMenu();
		
		this._fire('start');	
		this.scale();

		this._getData();

	},
	loading:function(show){
		var me = this;
		if (!this._loading){
			this._loading= $([
				'<div id="loading-overlay">',
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
			if (!this._hasLoadingOverlay){
				this._container.append(this._loading);
				this._hasLoadingOverlay = true;
				this._loading.animate({
					opacity:1,
				},100);
			}

		} else {
			if (this._hasLoadingOverlay){
				this._loading.animate({
					opacity:0,
				},100,function(){
					me._hasLoadingOverlay = false;
					me._loading.remove();
				})
			}
		}		
	},
	overlay:function(show){
		var me = this;
		if (!this._overlay){
			this._overlay= $([
				'<div id="overlay">',
				'<h1 class="main-title">rupu 0.1</h1>',
 				'<h3 class="sub-title">Metropolia / Heikki Pesonen / 2013</h3>',
 				'<img src="css/load-icon.png" alt="" class="clock-icon" />',
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
				},100);
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
		var topOffset = 0;///this.panes.top.height();

		this._container.css({
			top:0,
			height:window.innerHeight
		})

		this.panes.left.css({
			top:0,
			left:0,
			width:window.innerWidth > 900 ? (window.innerWidth*0.5 < 900 ? 900 : window.innerWidth*0.5) :  (window.innerWidth > 1000 ? 1000 : window.innerWidth)
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
			top: topOffset,
			width: this.panes.left.width() + this.panes.main.width() + this.panes.right.width()
		});


		this._leftPos = 0;
		this._mainPos = -this.panes.left.outerWidth(true);
		this._rightPos = -(this.panes.left.outerWidth(true) + this.panes.right.outerWidth(true));

		var w = this.panes.main_content.innerWidth();

		var s1 = (w),
			s2 = (w-32)/2,
			s3 = (w-46)/3,
			s4 = (w-58)/4;

		this._itemWidth = s1 < 900 ? s1 : s2 < 500 ? s2 : s3 > 450 ? s4 : s3;

		try{
			this._scrollRefresh();
			this._tile();
			this.tools.scaleHeight();

		} catch (e){
			this.error(e);
		}		
		this._fire('scale');
		this._showPane('main-pane');
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
		var me = this;
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
					if (Math.abs(diffToLeft)<Math.abs(diffToMain)){						
						me._fire('swipeTo','main-pane');
						this._showPane('main-pane');
					} else {						
						me._fire('swipeTo','right-pane');
						this._showPane('right-pane');
					}

				} else if (this._lastEvent.gesture.direction == 'right'){
					if (Math.abs(diffToRight)<Math.abs(diffToMain)){
						me._fire('swipeTo','main-pane');
						this._showPane('main-pane');
					} else {
						me._fire('swipeTo','left-pane');
						this._showPane('left-pane');
					}
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
		var diff = -this.panes.container._getPosition().left + position;

		this._animate(diff);
		this._fire('showPane',id);
	},	
	_sortSet:function(items){
		items.sort(function(a,b){
		
				return a.priority - b.priority;
			
		});
	},
	// show category of items by category name
	showItems:function(items,sort){
		var me = this,
			found = false,
			e = [];

		if (!sort){

			this._sortSet(items);
		}
	
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
		
		cat = cat.toLowerCase();

		this.tools.selectButton(cat);
		var items = this.getCategory(cat);
		this.showItems(items);
	
		this._container.css('background-color',colors.getColor(cat,1));
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
				me._pageScroll = new iScroll('page',me.iscrollOpts);
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
		container.imagesLoaded(function(){

			container.find('.tile').each(function(){
				$(this).css('width',me._itemWidth);
				if ($(this).hasClass('category')){
					$(this).css('height',me._itemWidth);
				}

				
				if (parseInt( $(this).attr('priority') ) < 6 && window.innerWidth >= me._itemWidth*2 && $(this).hasClass('has-image')){
					$(this).css('width',(me._itemWidth*2)+17);	
				} else if (parseInt( $(this).attr('priority') )> 8 && (me._itemWidth/2)>350){
					$(this).css('width',(me._itemWidth/2) -8);	
				}


			});
			/*
			var count = container.find('.category').length;
			if (count > 0){
				var view = container.find('#categoryview');
				var w = me.panes.main_content.innerWidth()-10,
					tilew = count%3 == 0 ? w/3 : w/4;

				container.find('.category').each(function(){
					
					$(this).css({
						display:'inline-block',
						width:tilew,
						height:tilew,
						//'background-color':colors.getColor($(this).attr('id'))
					}).find('h4').css({
						color:colors.getColor($(this).attr('id'))
					});
				});
			}
			*/
			var p = new Packery(container[0],{				
				gutter:15
			})

			me._scrollRefresh();			
			
			container.transit({
				opacity:1
			},500,function(){
				me.loading(false);
			});
		});
	},
	_showAtPane:function(content){
		var container = this.panes.main_content;
		var me = this;
			me._showPane('main-pane');
		
		this._fire('pageChangeStart');
	
		container.transit({
			opacity:0
		},200,function(){
	
			container.empty();
		
			each(content,function(item){
				item.hammer().on('tap',function(){
					if ($(this).hasClass('newsitem')){
						me.showItem($(this).attr('id'));
					} else if ($(this).hasClass('category')){

						me.showCategory($(this).attr('id'));
					}
				});
				container.append(item);

			});

			me._tile();

		});
	},
	_setMenu:function(){
		var me = this;
		var categories = this._getCategoryNames();		
		me.tools.reset();

		console.log(categories)
		categories.sort(function(a,b){
			
			return a < b ? -1 : 1;

		})

		me.tools.addButton({
			text:'kategoriat',
			id:'showCategories',
			background:colors.getColor('categories'),
			action:function(){
				me.showCategories();
			}
		})

		each(categories,function(catg){
				catg = catg.toLowerCase();
				me.tools.addButton({
						text:catg,
						id:catg,
						background:colors.getColor(catg),
						//textcolor:colors.getColor(catg),
						
						action:function(id){
							me._fire('menuButtonTap',id);
							me.showCategory(id);
						},
						target:catg.name
				});
		});
	
		me.scale();		
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
		
		if (name == 'etusivu'){
			result = this._makeFrontPage();

		} else {
			for (var i in this._items){
				if (this._items[i].category.toLowerCase() == name){
					result.push(this._items[i]);
				}
			}
		}
		return result;
	},
	_getFromCouch:function(){
		var me = this;
		$.ajax({
			url:'http://cdb.ereading.metropolia.fi/reader/_design/news/_view/strdate?key=%222013.05.15%22',
			dataType:'json',
			success:function(e){		
				for (var i in e.rows){
					if (e.rows[i].value.content){
						e.rows[i].value.image = e.rows[i].value.content;

						for (var c in e.rows[i].value.image){
							e.rows[i].value.image[c].url = 'http://ereading.metropolia.fi/puru/img/'+e.rows[i].value.image[c].name;
						}
					}

					me._items.push( new newsitem(e.rows[i].value));
				}

				me._getCategories();
				me._fire('load');
			}
		})
	},
	_makeFrontPage:function(){
		var frontPage = [];
		var cat = this._getCategoryNames();


		for (var i in cat){
			if (cat[i].toLowerCase() != 'etusivu'){
				var items = this.getCategory(cat[i]);

				items.sort(function(a,b){
					return a.priority - b.priority;
				});

				
				for (var c=0; c<4; c++){
					if (items[c] instanceof newsitem){
						frontPage.push( items[c] );
					}
				}
			}
		}

		frontPage.sort(function(a,b){
			if (a.hasImage()){
				return -1;
			} else if (b.hasImage()){
				return 1;
			} else {
				return 0;
			}
		});
		

		return frontPage;
	},
	_showBrand:function(data){
		var container = this.panes.brand;

		container.empty();
		container.append( $([
			'<h3>',data.title,'</h3>',
			'<img src="',data.image.url,'" alt="">',
			].join('')) );

		//this._container.append(this.panes.brand);
	},
	_getData:function(){
		var me = this;		
			$.ajax({
				url:'http://ereading.metropolia.fi/testirupu/parser.php',
				dataType:'JSON',
				success:function(e){
					var rs = JSON.parse(e);

					
					if (rs.status == 'ok'){
						me._showBrand(rs.source);

						for (var i in rs.data){
							me._items.push( new newsitem(rs.data[i]));
						}								
						me._source = rs.source;
						me._getCategories();
						me._fire('load',me._items);
					} else {
						

						me._getFromCouch();
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

function newsitem(data){
	for (var i in data){
		this[i] = data[i];
	}
}

newsitem.prototype = {
	hasImage:function(){
		var has = false;
		if (this.image){
			if (this.image[0]){
				has = true;
			}
		 }
		 return has;
	},
	getTile:function(){
		var txt = this.getShortText();
		var textcontainer = '';

		if (txt){
			textcontainer = 
					['<div class="textcontainer">',
						this.getShortText(),
					'</div>'].join('');
		}

		if (this.hasImage()){					
			return $([
				'<div class="newsitem tile container has-image" id="'+this._id+'">',
				'<h2 style="'+colors.getBackground(this.category,0.7)+'">'+this.title+'</h2>',
				//'<img class="newsitem-image" src="../puru/img/'+this.image[0].name+'"></img>',
				'<img  class="newsitem-image" src="',this.image[0].url,'" alt="" />',
				textcontainer,
				'<span class="date">'+getItemDate(this.pubdate)+'</span>',
				'<span class="source">'+this.author+'</span>',
				'</div>'
			].join(''));
		
		} else {
			return $([
				'<div class="newsitem tile container no-image" id="'+this._id+'">',						
				'<h2 style="'+colors.getBackground(this.category,0.7)+'">'+this.title+'</h2>',
				textcontainer,	
				'<span class="date">'+getItemDate(this.pubdate)+'</span>',			
				'<span class="source">'+this.author+'</span>',	
				'</div>'
			].join(''));
		}
	},
	getFull:function(){
		var image = '', hasImage = 'no-image';
		if (this.hasImage()){
			image = [
				'<div class="image-container">',
					//'<img src="../puru/img/',this.image[0].name,'" alt="" />',
					'<img src="',this.image[0].url,'" alt="" />',
					'<h1 style="'+colors.getBackground(this.category,0.8)+'" class="news-header">'+this.title+'</h1>',
				'</div>',
				].join('');

			hasImage = 'has-image';
		} else {
			image = '<h1 style="background-color: '+colors.getColor(this.category)+'" class="news-header">'+this.title+'</h1>';
		}

		return $([
			'<div id="page" data-item="'+this._id+'" class="',hasImage,' scale fullheight pagecontainer">',
				'<div id="page-scroll" class="page-scroll">',
					'<div class="news-page">',
						'<span style="'+colors.getBackground(this.category)+'" class="category">'+this.category+'</span>',						
						image,
						'<span class="author">',this.author,'</span>',
						'<div class="textcontainer">',
							this.text,
						'</div>',						
					'</div>',
				'</div>',
			'</div>'
		].join(''));
	},
	getShortText:function(len){				
		var t = $(this.text);
		var text = '';

		if (len == undefined){
			len = 150;
		}

		if ( $(t[1]).text().length < 70){ // tekijän nimi yleensä
			var txt = $(t[2]).text();//.substr(0,len) + '...';
			$(t[2]).text(txt);
			text =  $(t[2]).text();
		} else {
			var txt = $(t[1]).text();//.substr(0,len) + '...';
			$(t[1]).text(txt);
			
			text =  $(t[1]).text();
		}		

		if (text.length > len){
			text = text.substr(0,len) + '...';
		}

		return text;
	}			
}
/*
function newsItem(data){
	if (data){
		this.load(data);
	}
}

newsItem.prototype = {
	load:function(data){
		for (var i in data){
			this[i] = data[i];
		}	
	},
	getListItem:function(){		
		var e = $('<li class="clickable smallListItem listItem"></li>');
		e.attr('id',this._id);

		if (this.content){
			if (this.content.length > 0){
				e.append('<img src="'+IMG_URL +'thumb/'+ this.content[0].name+'" class="small-image"/>');
				e.addClass('has-image');
			} else {
				e.addClass('no-image');
			}
		}else {
			e.addClass('no-image');
		}
		//var c = $('<div class="textcontainer"></div>');

		var c = $('<h4 style="color:'+colors.getColor(this.category,1)+'">'+this.title+'</h4>');

		e.append('<span class="pubdate">'+getItemDate(this.pubdate)+'</span>');
		e.append('<span class="category">'+this.category+'</span>')

		e.append(c);

		return e;
	},
	getTile:function(){
		var data = this._data;
		var d = $('<div class="item tile" data-action="showItem"  data-target="'+this._id+'"></div>');
		var e = $('<div class="container"></div>');

		d.attr('id',this._id);

		if (this.important == true){
			
			d.addClass('important');
		}

		if (this.content){
			if (this.content.length > 0){
				var image= this.content[0];
				var url = FULLIMG_URL;
				if (window.innerWidth > 700){
					if (window.innerWidth/3 < (image.sizes[0][0])){
						url = SMALLIMG_URL;
					} 
				} else {
					if (window.innerWidth < (image.sizes[0][0]/2)){
						url = SMALLIMG_URL;
					} 
				}
				url +=  image.name;


				e.append('<div class="img-container news-image"><img src="'+url+'" class="big-image"/></div>');
				d.addClass('has-image');
				d.attr('img-size',image.sizes[0][0] +','+image.sizes[0][1]);

				if (image.sizes[0][1] > image.sizes[0][0]){
					d.addClass('thin');
				} else {
					d.addClass('wide');
				}

				e.find('.img-container')
					.append('<h2 style="background-color:'+colors.getColor(this.category)+'">'+this.title+'</h2>')
					//.append('<div class="image-text" style="background-color:'+colors.getColor(this.category)+'">'+image.text+'</div>')
					.append('<span style="background-color:'+colors.getColor(this.category)+'"class="category">'+this.category+'</span>');

				
				if (this.getShortText(data)!= "" && this.getShortText(data).length > 20){
					e.append('<div class="textcontainer"><p>'+this.getShortText(data)+'</p></div>');
				}

				e.append('<span class="date">'+getItemDate(this.pubdate)+'</span>')
			}


		} else {
				d.addClass('no-image');

				e	
					.append('<span style="background-color:'+colors.getColor(this.category)+'"class="wide category">'+this.category+'</span>')
					.append( $('<div class="content"></div>')
					.append('<h2  >'+this.title+'</h2>')
					.append('<div class="textcontainer"><p>'+this.getShortText(data)+'</p></div>')
					.append('<span class="date">'+getItemDate(this.pubdate)+'</span>')

					);

		}

		d.append(e);
		d.addClass('prio-'+this.priority);
		return d;		
	},
	getFull:function(){		
		var item = this;
		
		var c = $('<div id="page" data-item="'+this._id+'" class="scale fullheight pagecontainer"></div>'),
			scroll = $('<div id="page-scroll" class="page-scroll"></div>'),
			
			e = $('<div class="news-page"></div>');

		//scroll.append('<div class="top-edge"></div><div class="bottom-edge"></div>');
		e.append('<span style="background-color: '+colors.getColor(item.category)+'" class="category">'+this.category+'</span>')

		if (this.content){
			c.addClass('has-image');
			var imgCont = $('<div class="imagecontainer"></div>');
			

			//each(item.content,function(img){
				img = item.content[0];

				var im = $('<img src="'+FULLIMG_URL+img.name+'" alt="" />');
				imgCont.html(im);
				
				if (img.sizes[0][1] > img.sizes[0][0]){
					im.addClass('thin');
					c.addClass('thin-image');
				} else {
					c.addClass('wide-image');
					im.addClass('wide');
				}
			//});

			imgCont.append('<h1 style="background-color: '+colors.getColor(item.category)+'" class="news-header">'+item.title+'</h1>');
			e.append(imgCont)
		} else {
			c.addClass('no-image');
			e.addClass('no-image');
			var head = $('<div class="header"  ></div>');
				head.append('<h1 style="color: '+colors.getColor(item.category)+'" class="news-header">'+item.title+'</h1>');

			e.append(head);
		}

		
		var body = $('<div class="textcontainer"></div>');
			body.append(item.text);



		
		c.append( scroll.append( e.append(body).append('<div class="clear"></div>') ) );

		return c; 
		
	},
	getShortText:function(len){
		var t = $(this.text);
		var text = '';

		if (len == undefined){
			len = 150;
		}

		if ( $(t[1]).text().length < 70){ // tekijän nimi yleensä
			var txt = $(t[2]).text();//.substr(0,len) + '...';
			$(t[2]).text(txt);
			text =  $(t[2]).text();
		} else {
			var txt = $(t[1]).text();//.substr(0,len) + '...';
			$(t[1]).text(txt);
			
			text =  $(t[1]).text();
		}		

		if (text.length > len){
			text = text.substr(0,len) + '...';
		}

		return text;
	}
};
*/
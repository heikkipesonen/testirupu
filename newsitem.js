
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
	getImage:function(){
		if (this.hasImage()){
			return this.image[0].url;
		} else {
			return false;
		}
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
				'<div class="newsitem tile container has-image" priority="',this.priority,'" id="'+this._id+'">',
				'<div class="newsitem-imagecontainer">',
					'<img  class="newsitem-image" src="',this.image[0].url,'" alt="" />',
					'<div class="image-item-header-container" style="'+colors.getBackground(this.category,0.7)+'">',
						'<h2>'+this.title+'</h2>',
					'</div>',
				'</div>',
				textcontainer,
				'<div class="bottom-bar">',
					'<span class="date">'+getItemDate(this.pubdate)+'</span>',
					'<span class="source">'+this.author+'</span>',
				'</div>',
				'</div>'
			].join(''));
		
		} else {
			return $([
				'<div class="newsitem tile container no-image"  priority="',this.priority,'" id="'+this._id+'">',						
					'<div class="header-container">',
						'<h2 style="'+colors.getBackground(this.category,1)+'">'+this.title+'</h2>',
					'</div>',
					textcontainer,	
					'<div class="bottom-bar">',
						'<span class="date">'+getItemDate(this.pubdate)+'</span>',	
						'<span class="source">'+this.author+'</span>',	
					'</div>',
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
			image = '<div class="page-header-container"><h1 style="'+colors.getBackground(this.category,0.7)+'" class="news-header">'+this.title+'</h1></div>';
		}

		return $([
			'<div id="page" data-item="'+this._id+'" class="',hasImage,' pagecontainer">',
				'<div id="page-scroll" class="page-scroll">',
					'<div class="news-page">',
						image,
						'<div class="textcontainer">',							
							'<div class="textcontainer-content">',
								this.text,
							'</div>',
						'</div>',
						'<div class="bottom-bar">',	
							'<span class="category">'+this.category+'</span>',						
							'<span class="date">'+getItemDate(this.pubdate)+'</span>',
							'<span class="author">',this.author,'</span>',
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
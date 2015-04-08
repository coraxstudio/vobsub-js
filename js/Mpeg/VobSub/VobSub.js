function VobSub(idxUrl, subUrl, videoID){
	this.IDXUrl = idxUrl;
	this.SUBUrl = subUrl;
	this.IDX    = null;
	this.SUB    = null;
	this.Video  = document.getElementById(videoID);	
	this.Video.width = 0;
	this.Video.height = 0;
}

VobSub.prototype.Destruct = function(){
	this.IDX.Destruct();
	this.SUB.Destruct();
	
	delete this.IDX;
	delete this.SUB;
	delete this.Video;
}

VobSub.prototype.Start = function(){
	var that = this;
	//The offset into the timetable
	var i = 0; 
	//The time and offset for the next subtitle
	var next = this.IDX.TimeTable[i]; 
	
	this.Video.addEventListener("loadedmetadata", function(){
		that.SetVideoSize();		
	});
	
	this.Video.currentTime = 80;
	this.Video.addEventListener("timeupdate", function(){
		if(that.Video.currentTime >= next.Timestamp){
			console.log("Subtitle Delay: " + (that.Video.currentTime - next.Timestamp));
			that.DisplaySubtitle(next.Offset);			
			next = that.IDX.TimeTable[++i];
		}		
	});		
}

VobSub.prototype.SetVideoSize = function(){
	var scaleX = window.innerWidth  / this.Video.videoWidth;
	var scaleY = window.innerHeight / this.Video.videoHeight;
	var scale  = Math.min(scaleX, scaleY);
	console.log(scale);
	
	this.Video.width  = this.Video.videoWidth  * scale;
	this.Video.height = this.Video.videoHeight * scale;	
}

VobSub.prototype.DisplaySubtitle = function(offset){
	this.SUB.Stream.Offset = offset;
	
	var spu = this.SUB.ReadSPU();
	if(!spu){
		console.log("SPU Read Error");
		return false;
	}
	spu.Read();
	
	var g = spu.GetGraphics(this.IDX.Palette);
	g.Show();
	setTimeout(function(){
		g.Destruct();
	},
	g.Time);
	
	spu.Destruct();
}

VobSub.prototype.Load = function(idxUrl, subUrl){
	this.LoadIDX();
}

VobSub.prototype.LoadIDX = function(){
	var that = this;
	
	var loader = new TextLoader(this.IDXUrl);
	loader.OnError = function(error){
		that.OnError(error);
	}
	
	loader.OnLoad = function(data){
		that.IDX = new IDX();
		that.IDX.Parse(data);		
		that.LoadSUB();
	}
	loader.Load();
}

VobSub.prototype.LoadSUB = function(){
	var that = this;
	
	var loader= new BinaryLoader(subUrl);
	loader.OnError = function(error){
		that.OnError(error);
	}
	
	loader.OnLoad = function(data){
		that.SUB = new MPEG2(data);
		that.OnReady();
	}
	
	loader.Load();	
}

//Events
VobSub.prototype.OnReady = function(){};
VobSub.prototype.OnError = function(error){};

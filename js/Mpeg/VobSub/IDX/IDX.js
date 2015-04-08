function IDX(){
	//Original frame size
	this.Size = {
		Width  : 0,
		Height : 0
	} 

	//Origin, relative to the upper-left corner, can be overloaded by alignment
	this.Origin = {
		X: 0,
		Y: 0
	}
	
	//Image scaling (in percent), origin is at the upper-left corner at the alignment coordinate (x,y)
	this.Scale = {
		Horizontal : 1.0,
		Vertical   : 1.0
	}
	
	//Alpha blending (in percent)
	this.Alpha = 1.0;
	
	//Smoothing for very blocky images(use old for no filtering)
	this.Smooth = false;
	
	//Fade time in millisecs
	this.Fade = {
		In:  0,
		Out: 0
	}
	
	//Force subtitle placement relative to (origin.x, origin.y)
	this.Align = "";	
	
	//For correcting non-progressive desync (in millisecs)
	this.TimeOffset = 0;
	
	//Forced subs, true = display only forced subtitles, false = shows everything
	this.Forced = false;
	
	//The original palette of the dvd		
	this.Palette = [];
	
	//4 Custom colors(transparency is applied)
	this.CustomPalette = [];
	
	//Language 
	this.ID = "";
	
	//Language index in use
	this.Index = null;
	
	//Timestamp, Offset table
	this.TimeTable = [];
}

IDX.prototype.Parse = function(text){
	var CmdArg
	var Line = text.split("\n");
	for(var i = 0; i < Line.length; i++){
		//Skip comments and blank lines	
		if(Line[i].charAt(0) == "#" || Line[i].trim() === ""){
			continue;
		}
				
		//Split line into a command and argument
		CmdArg = Line[i].split(":");
		
		//Call appropriate function
		switch(CmdArg[0]){
			case "timestamp":
				this.ParseTimestamp(CmdArg);
				break;
			case "size":
				this.ParseSize(CmdArg[1]);
				break;
			case "org":
				this.ParseOrigin(CmdArg[1]);
				break;
			case "scale":
				this.ParseScale(CmdArg[1]);
				break;
			case "alpha":
				this.ParseAlpha(CmdArg[1]);
				break;
			case "smooth":
				this.ParseSmooth(CmdArg[1]);
				break;
			case "fadein/out":
				this.ParseFade(CmdArg[1]);
				break;
			case "align":
				this.ParseAlign(CmdArg[1]);
				break;
			case "time offset":
				this.ParseTimeOffset(CmdArg[1]);
				break;
			case "forced subs":
				this.ParseForced(CmdArg[1]);
				break;
			case "palette":
				this.ParsePalette(CmdArg[1]);
				break;
			case "custom colors":
				this.ParseCustomColors(CmdArg);
				break;
			case "id":
				this.ParseId(CmdArg);
				break;
			default:
				console.log("Unknown .idx command!\nCommand:" + CmdArg[0] + "\nArgument:" + CmdArg[1] + "\nSourceText:"+Line[i].charAt(0));
				break;
		}	
	}
}

IDX.prototype.ParseTimestamp = function(args){	
	//Convert hh:mm:ss:ms to float sec.ms
	var Timestamp = parseFloat(args[1]) * 3600; //Hours to seconds
	Timestamp += parseFloat(args[2]) * 60;   //Minutes to seconds
	Timestamp += parseFloat(args[3]); 		  //Seconds
	Timestamp += parseFloat(args[4].split(",")[0]) / 1000; //Milliseconds
		
	//Convert offset from hex to int
	var Offset = parseInt(args[5], 16);
		
	//Add time offset to list
	this.TimeTable.push({
		 Timestamp : Timestamp,
		 Offset    : Offset
	});			
}

IDX.prototype.ParseSize = function(text) {
	var Size = text.split("x");
	
	this.Size.Width  = parseInt(Size[0]);
	this.Size.Height = parseInt(Size[1]);	
}

IDX.prototype.ParseOrigin = function(text) {
	var Origin = text.split(",");
	
	this.Origin.X = parseInt(Origin[0]);
	this.Origin.Y = parseInt(Origin[1]);
}

IDX.prototype.ParseScale = function(text) {
	var Scale = text.split(",");
	
	this.Scale.Horizontal = parseFloat(Scale[0]) / 100;
	this.Scale.Vertical   = parseFloat(Scale[1]) / 100;
}

IDX.prototype.ParseAlpha = function(text) {
	this.Alpha = parseFloat(text) / 100;
}

IDX.prototype.ParseSmooth = function(text) {
	if(text.trim().toUpperCase() == "OFF"){
		this.Smooth = false;
	}else{
		this.Smooth = true;
	}	
}

IDX.prototype.ParseFade = function(text) {
	var Fade = text.split(",");
	
	this.Fade.In  = parseInt(Fade[0]);
	this.Fade.Out = parseInt(Fade[1]);
}

IDX.prototype.ParseAlign = function(text) {
	this.Align = text;
}

IDX.prototype.ParseTimeOffset = function(text) {
	this.TimeOffset = parseInt(text);
}

IDX.prototype.ParseForced = function(text) {
	if(text.trim().toUpperCase() == "OFF"){
		this.Forced = false;
	}else{
		this.Forced = true;
	}
}

IDX.prototype.ParsePalette = function(text){
	Colors = text.split(",");	
	for(var i = 0; i < Colors.length; i++){
		this.Palette.push(new Color(Colors[i]));
	}
}

IDX.prototype.ParseCustomColors = function(args) {
	if(args[1].split(",")[0].toUpperCase() == "OFF"){
		return;
	}
	
	var Alpha = args[2].split(",")[0];
	Alpha = Alpha.trim();
	
	var Colors = args[3].split(",");
	
	var C;	
	C = new Color(Colors[0]);;
	C.Alpha = parseInt(Alpha.charAt(0));
	this.CustomPalette.push(C);
	
	C = new Color(Colors[1]);
	C.Alpha = parseInt(Alpha.charAt(1));
	this.CustomPalette.push(C);
	
	C = new Color(Colors[2]);
	C.Alpha = parseInt(Alpha.charAt(2));
	this.CustomPalette.push(C);
	
	C = new Color(Colors[3]);
	C.Alpha = parseInt(Alpha.charAt(3));
	this.CustomPalette.push(C);		
}

IDX.prototype.ParseId = function(args) {
	this.ID = args[1].split(",")[0];
	this.ID = this.ID.trim();
	
	this.Index = parseInt(args[2]);
}

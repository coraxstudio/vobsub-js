function Color(){
	this.Red   = 0;
	this.Green = 0;
	this.Blue  = 0;
	this.Alpha = 1;
	
	switch(arguments.length){
		case 1:
			this.FromHex(arguments[0]);
			break;
		case 3:
			this.FromRGB(arguments[0], arguments[1], arguments[2]);
			break;
		case 4:
			this.FromRGBA(arguments[0], arguments[1], arguments[2], arguments[3]);
			break;
	}
}

Color.prototype.ApplyAlpha = function(hex){
	this.Alpha = hex / 15;
}

Color.prototype.FromRGb = function(r, g, b){
	this.Red   = r;
	this.Green = g;
	this.Blue  = b;
}

Color.prototype.FromRGb = function(r, g, b, a){
	this.FromRGB(r, g, b);
	this.Alpha = a;
}

Color.prototype.FromHex = function(hex){
	hex = hex.trim();
	
	var Offset = 0;
	if(hex.charAt(0) == "#"){
		Offset = 1;
	}
	
	this.Red   = parseInt("0x" + hex.substring(Offset, Offset + 2));
	this.Green = parseInt("0x" + hex.substring(Offset + 2, Offset + 4));
	this.Blue  = parseInt("0x" + hex.substring(Offset + 4, Offset + 6));	
}

Color.prototype.ToRGB = function(){
	return "rgba(" +this.Red+ "," +this.Green+ "," +this.Blue+ "," +this.Alpha+ ")";
}

Color.prototype.ToHex = function(){
	return "#" + this.Red.toString(16) + this.Green.toString(16) + this.Blue.toString(16);
}

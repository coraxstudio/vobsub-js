function SPUPackage(){
	this.Buffer  = new MPEG2Stream();
	this.Length  = 0;	
	this.Control = null;
}

SPUPackage.prototype.Destruct = function(){	
	delete this.Buffer;	
	delete this.Control;	
}

SPUPackage.prototype.Read = function(){
	//First two bytes is length
	this.Length = this.Buffer.Get16();

	//Adjust stream offset to point to the control section
	//the offset is byte 3-4
	this.Buffer.Offset = this.Buffer.Get16();
	
	//Setup and read control sequences
	this.Control = new SPUControl();
	this.Control.Read(this.Buffer);
}

SPUPackage.prototype.GetGraphics = function(palette){
	//The plus one baffles me but it's needed
	var width  = (this.Control.X2 - this.Control.X1) + 1;
	var height = (this.Control.Y2 - this.Control.Y1) + 1;
	
	var graphics = new SPUGraphics(this.Control.X1, this.Control.Y1, width, height);
	graphics.Time = (this.Control.StopDate - this.Control.StartDate) * 10;
	graphics.FillPalette(palette, this.Control.Palette, this.Control.Alpha);	
	graphics.DrawEven(this.Buffer, this.Control.OffsetEven);
	graphics.DrawOdd(this.Buffer, this.Control.OffsetOdd);
	return graphics;
}

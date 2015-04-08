function SPUGraphics(x, y, width, height){
	//Public
	this.Width   = width;
	this.Height  = height;
	this.X		 = x;
	this.Y       = y;
	this.Time    = 0;
	this.Palette = null;
	this.Canvas  = null;	
	this.Context = null;
	
	//Private
	this.DrawX = 0;
	this.DrawY = 0;
	
	//Setup
	this.CreateCanvas();
}

SPUGraphics.prototype.Destruct = function(){
	this.Hide();
	
	delete this.Context;
	delete this.Canvas;
}

SPUGraphics.prototype.CreateCanvas = function(){
	this.Canvas = document.createElement("canvas");
	this.Canvas.class  = "subtitle";
	this.Canvas.width  = this.Width;
	this.Canvas.height = this.Height;
	
	this.Canvas.style.position = "absolute";
	this.Canvas.style.top  	   = this.Y +"px";
	this.Canvas.style.left 	   = this.X +"px";	
	
	this.Context = this.Canvas.getContext("2d");	
}

SPUGraphics.prototype.Show = function(){
	document.body.appendChild(this.Canvas);
}

SPUGraphics.prototype.Hide = function(){
	document.body.removeChild(this.Canvas);
}

SPUGraphics.prototype.FillPalette = function(colors, palette, alpha){
	this.Palette = [];
	this.Palette.push(this.ComputeColor(colors, palette, alpha, 0));
	this.Palette.push(this.ComputeColor(colors, palette, alpha, 1));
	this.Palette.push(this.ComputeColor(colors, palette, alpha, 2));
	this.Palette.push(this.ComputeColor(colors, palette, alpha, 3));	
}

SPUGraphics.prototype.ComputeColor = function(colors, palette, alpha, index){
	var color =	colors[palette[index]];
	color.ApplyAlpha(alpha[index]);
	return color.ToRGB();
}

SPUGraphics.prototype.DrawEven = function(buffer, offset){
	buffer.Offset = offset;
	this.Draw(buffer, 0, 0);
}

SPUGraphics.prototype.DrawOdd = function(buffer, offset){
	buffer.Offset = offset;
	this.Draw(buffer, 0, 1);
}

SPUGraphics.prototype.Draw = function(buffer, x, y){
	this.DrawX = x;
	this.DrawY = y;
	
	while(this.DrawY < this.Height){
		if(this.DrawCommand(buffer)){			
			buffer.Align();
		}
	}
}

SPUGraphics.prototype.DrawCommand = function(buffer){
	var Nibble = buffer.Get4();
	switch(Nibble){
		case 0xf:
		case 0xe:
		case 0xd:
		case 0xc:
		case 0xb:
		case 0xa:
		case 0x9:
		case 0x8:
		case 0x7:
		case 0x6:
		case 0x5:
		case 0x4:
			return this.DrawRLE(Nibble);
	}
		
	switch(Nibble){
		case 0x3:
		case 0x2:
		case 0x1:
			Nibble = (Nibble << 4) | buffer.Get4();
			return this.DrawRLE(Nibble);
	}
	
	Nibble = (Nibble << 4) | buffer.Get4();
	switch(Nibble){
		case 0x0f:
		case 0x0e:
		case 0x0d:
		case 0x0c:
		case 0x0b:
		case 0x0a:
		case 0x09:
		case 0x08:
		case 0x07:
		case 0x06:
		case 0x05:
		case 0x04:
			Nibble = (Nibble << 4) | buffer.Get4();
			return this.DrawRLE(Nibble);
	}
	
	switch(Nibble){
		case 0x03:
		case 0x02:
		case 0x01:
			Nibble = (Nibble << 4) | buffer.Get4();
			Nibble = (Nibble << 4) | buffer.Get4();
			return this.DrawRLE(Nibble);
	}
	
	Nibble = (Nibble << 4) | buffer.Get4();
	Nibble = (Nibble << 4) | buffer.Get4();
	
	buffer.Align();
	
	return this.DrawToEOL();
}

/**
 * Extract color and length from run length encoded number and draw it.
 *
 * @return bool Returns true if this draw forced a newline false otherwise
 */
SPUGraphics.prototype.DrawRLE = function(rle){
	return this.DrawSegment(rle >> 2, rle & 0x3);
}

/**
 * Draw to end of line
 *
 * @return bool Returns true if this draw forced a newline false otherwise
 */

SPUGraphics.prototype.DrawToEOL = function(){
	return this.DrawSegment(this.Width - this.DrawX, 0);
}

/**
 * Draw a segement at the current x and y position
 *
 * @return bool Returns true if this draw forced a newline false otherwise
 */
SPUGraphics.prototype.DrawSegment = function(length, color){
	this.Context.fillStyle = this.Palette[color];
	this.Context.fillRect(this.DrawX, this.DrawY, length, 1);
	
	this.DrawX += length;
	if(this.DrawX == this.Width){
		this.DrawY += 2;
		this.DrawX  = 0;
		return true;
	}		
	return false;
}

function SPUControl(){
	//Public
	this.ForceDisplay;
	this.StartDate;
	this.StopDate;
	this.Palette;
	this.Alpha;
	this.X1;
	this.X2;
	this.Y1;
	this.Y2;
	this.OffsetEven;
	this.OffsetOdd;
}

SPUControl.prototype.Read = function(stream){
	var Run = true;
	do {
		//Get date and next data
		var CmdDate = stream.Get16();
		var CmdNext = stream.Get16();
	
		//Continue to process control sequences until next is equal to the current offset	
		if(CmdNext == (stream.Offset - 4)){
			Run = false
		}		
		
		//Read control sequence
		this.ReadControlSequence(stream, CmdDate, CmdNext);
	} while(Run);
}

SPUControl.prototype.ReadControlSequence = function(stream, date, next){
	while(true){
		switch(stream.Get8()){
			case 0x00:
				//Force displaying 
				this.ForceDisplay = true; 
				break;
			case 0x01:
				//Start date
				this.StartDate = date;
				break;
			case 0x02: 
				//Stop date
				this.StopDate = date;
				break;
			case 0x03: 
				//Palette
				this.ExtractPalette(stream);								
				break;
			case 0x04: 
				//Alpha Channel
				this.ExtractAlpha(stream);				
				break;
			case 0x05: 
				//Coordinates
				this.ExtractCoordinates(stream);
				break;
			case 0x06: 
				//RLE Offsets
				this.ExtractOffsets(stream);				
				break;
			case 0x07:
				console.log("Unimplemented command feature 0x07");
				return false;
			case 0xff: 
				//End command
				return true;
			default:
				console.log("Unknow ctrl sequence command");
				return false;
		}
	}
}

/**
 * 0x03 Set Color
 * Provides four indices into the color table. One nibble per pixel 
 * value for a total of 2 bytes.
 * c1 c2 c3 c4
 */
SPUControl.prototype.ExtractPalette = function(stream){
	var Data = stream.Get16();
	
	this.Palette = [];
	this.Palette.push( (Data & 0xF000) >> 12 );
	this.Palette.push( (Data & 0x0F00) >> 8  );
	this.Palette.push( (Data & 0x00F0) >> 4  );
	this.Palette.push( (Data & 0x000F)		 );
}

/**
 * 0x04 Set Contrast
 * Provides the four contrast (alpha blend) values to associate with the four pixel values. 
 * One nibble per pixel value for a total of 2 bytes. 0x0 = transparent, 0xF = opaque
 * a1 a2 a3 a4
 */
SPUControl.prototype.ExtractAlpha = function(stream){
	var Data = stream.Get16();
	
	this.Alpha = [];
	this.Alpha.push( (Data & 0xF000) >> 12 );
	this.Alpha.push( (Data & 0x0F00) >> 8  );
	this.Alpha.push( (Data & 0x00F0) >> 4  );
	this.Alpha.push( (Data & 0x000F)	   );
}

/**
 * 0x05 Set Display Area
 * Defines the display area, each pair (X and Y) of values is 3 bytes wide, 
 * for a total of 6 bytes, and has the form
 * sx sx   sx ex   ex ex   sy sy   sy ey   ey ey 
 */
SPUControl.prototype.ExtractCoordinates = function(stream){
	var Data = stream.Get24();	
	this.X1 = Data >> 12;
	this.X2 = Data & 0x000FFF;
	
	Data = stream.Get24();	
	this.Y1 = Data >> 12;
	this.Y2 = Data & 0x000FFF;
}

/**
 * 0x06 Set Display Address
 * Defines the pixel data addresses. First a 2-byte offset to the top field data, 
 * followed by a 2-byte offset to the bottom field data, for a total of 4 bytes.
 */
SPUControl.prototype.ExtractOffsets = function(stream){
	this.OffsetEven = stream.Get16();
	this.OffsetOdd  = stream.Get16();	
}

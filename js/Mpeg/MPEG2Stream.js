function MPEG2Stream(buffer, offset){
	this.Buffer = (buffer) ? new Uint8Array(buffer) : new Uint8Array();
	this.Offset = (offset) ? offset : 0;	
	this.Count  = 0; //Keep a count of data in the size of nibbles i.e. 4bits at a time
}

MPEG2Stream.prototype.Destruct = function(){
	delete this.Buffer;
	delete this.Offset;
}

MPEG2Stream.prototype.EndOfStream = function(){
	return (this.Offset == this.Buffer.byteLength);
}

MPEG2Stream.prototype.GetLength = function(){
	return this.Buffer.byteLength;
}

MPEG2Stream.prototype.Append = function(buffer){	
	if(this.Buffer == null){
		this.Buffer	= new Uint8Array(buffer);
	}else{		
		this.Buffer = this.Combine(this.Buffer, new Uint8Array(buffer));
	}
}

/**
 * Concatenate to Uint8Arrays
 *
 * @param  Uint8Array a1 Array to be placed at the front of the resulting array
 * @param  Uint8Array a2 Array to be placed at the end of the resulting array
 * @return Uint8Array The resulting array from concatenating a1+a2
 */ 
MPEG2Stream.prototype.Combine = function(a1, a2){
	var result = new Uint8Array(a1.byteLength + a2.byteLength);
	result.set(a1);
	result.set(a2, a1.byteLength);
	return result;
}

MPEG2Stream.prototype.Slice = function(length){	
	var data = this.Buffer.buffer.slice(this.Offset, this.Offset + length);
	this.Offset += length;
	return data;
}

MPEG2Stream.prototype.Align = function(){
	if((this.Count % 2) != 0){
		this.Get4();		
	}
}

MPEG2Stream.prototype.Forward = function(numBytes){
	this.Offset += numBytes;
}

MPEG2Stream.prototype.Rewind = function(numBytes){
	this.Offset -= numBytes;
}

MPEG2Stream.prototype.Rewind8 = function(){
	this.Offset -= 1;
}

MPEG2Stream.prototype.Rewind16 = function(){
	this.Offset -= 2;
}

MPEG2Stream.prototype.Rewind24 = function(){
	this.Offset -= 3; 
}

MPEG2Stream.prototype.Rewind32 = function(){
	this.Offset -= 4;
}


//Take caution when combining the usage of Get4 with any other function
//The offset increment will only happen after two nibble calls
MPEG2Stream.prototype.Get4 = function(){
	var Nibble;

	if(this.Count % 2 == 0){
		Nibble = this.Buffer[this.Offset] >> 4;   //High order bits on even count
	}else{
		Nibble = this.Buffer[this.Offset] & 0x0F; //Low order bits on odd count
		this.Offset++;
	}
	this.Count++
	
	return Nibble;
}

MPEG2Stream.prototype.Get8 = function(){
	return this.Buffer[this.Offset++];
}

MPEG2Stream.prototype.Get16 = function(){
	var data = this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];
	return data >>> 0;
}

MPEG2Stream.prototype.Get24 = function(){
	var data = this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];
	return data >>> 0;
}

MPEG2Stream.prototype.Get32 = function(){
	var data = this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];
	data = (data << 8) | this.Buffer[this.Offset++];	
	return data >>> 0; //See http://stackoverflow.com/questions/22335853/hack-to-convert-javascript-number-to-uint32
}

MPEG2Stream.prototype.Peek4 = function(){
	var Nibble;
	if(this.Count % 2 == 0){
		Nibble = this.Buffer[this.Offset] >> 4;   //High order bits on even count
	}else{
		Nibble = this.Buffer[this.Offset] & 0x0F; //Low order bits on odd count
		
	}
	return Nibble;
}

MPEG2Stream.prototype.Peek8 = function(){
	return this.Buffer[this.Offset];
}

MPEG2Stream.prototype.Peek16 = function(){
	var data = this.Buffer[this.Offset];
	data = (data << 8) | this.Buffer[this.Offset + 1];	
	return data;
}

MPEG2Stream.prototype.Peek24 = function(){
	var data = this.Buffer[this.Offset];
	data = (data << 8) | this.Buffer[this.Offset + 1];
	data = (data << 8) | this.Buffer[this.Offset + 2];
	return data;
}

MPEG2Stream.prototype.Peek32 = function(){
	var data = this.Buffer[this.Offset];
	data = (data << 8) | this.Buffer[this.Offset + 1];
	data = (data << 8) | this.Buffer[this.Offset + 2];
	data = (data << 8) | this.Buffer[this.Offset + 3];	
	return data >>> 0;
}
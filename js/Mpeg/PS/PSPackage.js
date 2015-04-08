/**
 * Program Stream Package
 *
 * See: ISO 13818-1 for specification
 */
function PSPackage(){
	this.Header = {
		StartCode	 	: 0,
		SCR0_14		 	: 0,
		SCR15_29	 	: 0,
		SCR30_32	 	: 0,
		SCRExtension 	: 0,
		MuxRate		 	: 0,
		Reserved 		: 0,
		StuffingLength 	: 0
	}
	
	this.System = {
		StartCode: 					0,
		HeaderLength: 				0,
		RateBound: 					0,
		AudioBound: 				0,
		FixedFlag: 					0,
		CSPSFlag: 					0,
		AudioLockFlag: 				0,
		VideoLockFlag: 				0,
		VideoBound: 				0,
		PacketRateRestrictionFlag: 	0
	}	
}

PSPackage.prototype.Destruct = function(){
	this.Header = null;
	this.System = null;
}

PSPackage.prototype.Read = function(stream){
	//Verify that the first 32 bits is ps package start code
	if(stream.Get32() == 0x000001BA){
		this.StartCode = 0x000001BA;
		this.ReadHeader(stream);		
	}else{
		stream.Rewind32();
		return false;
	}	
	
	//Read PS System Header if it exists	
	if(stream.Get32() == 0x000001BB){
		this.ReadSystem(this.Stream);	
	}else{		
		stream.Rewind32();
	}
	
	return true;		
}

/**
 * 16 Bytes + stuffing length
 */
PSPackage.prototype.ReadHeader = function(stream){
	/**
	 * Bits Syntax
	 *  2 	01
	 *  3 	(x) system clock reference 30 to 32
	 *  1 	marker bit
	 * 15	(y) system clock reference 15 to 29
	 *  1 	marker bit
	 * 15   (z) system clock reference 0 to 14
	 *  1   marker bit
	 *  9   (e) system clock reference extension
	 *  1	marker bit
	 * 22	(m) program mux rate
	 *  1   marker bit
	 *  1   marker bit
	 *  5	(r) reserved
	 *  3   (s) stuffing length (in bytes) max 7
	 *
	 * Bit Pattern
	 * 01xx x1yy yyyy yyyy yyyy y1zz zzzz zzzz
	 * zzzz z1ee eeee eee1 mmmm mmmm mmmm mmmm
	 * mmmm mm11 rrrr rsss
	 */
	 
	 //01xx x1yy yyyy yyyy yyyy y1zz zzzz zzzz
	 var Bits = stream.Get32(); 
	 	 	 
	 //Get system clock reference base 30 to 32
	 this.Header.SCR30_32 = (Bits >> 27) & 0x7;
	 
	 //Get system clock reference base 15 to 29
	 this.Header.SCR15_29 = (Bits >> 11) & 0x7FFF;
	 
	 //Get system clock reference base 0 to 14 (10 bits)
	 this.Header.SCR15_29 = (Bits & 0x3FF) << 5;
	 
	 //zzzz z1ee eeee eee1 mmmm mmmm mmmm mmmm	 
	 Bits = stream.Get32();
	 
	 //Get system clock reference base 0 to 14 (5 bits)
	 this.Header.SCR15_29 |= (Bits >> 27);
	 
	 //Get system clock reference extension
	 this.Header.SCRExtension = (Bits >> 17) & 0x1FF;
	 
	 //Get program mux rate (16 bits)
	 this.Header.MuxRate = (Bits & 0xFFFF) << 6;
	 
	 //mmmm mm11 rrrr rsss
	 Bits = stream.Get16();
	 
	 //Get program mux rate (6 bits)
	 this.Header.MuxRate |= (Bits >> 10);
	 
	 //Get stuffing length
	 this.Header.StuffingLength = (Bits & 0x7);	
	 
	 //Increment stream past stuffing
	 stream.Forward(this.Header.StuffingLength);	
}

PSPackage.prototype.ReadSystem = function(stream){
	/**
	 * Bits Syntax
	 * 16 	(h) header length
	 *  1   marker bit
	 * 22 	(b) rate bound
	 *  1 	marker bit
	 *  6	(a) audio bound
	 *  1 	(f) fixed flag
	 *  1   (c) csps flag
	 *  1   (x) sytem audio lock flag
	 *  1   (y) system video lock flag
	 *  1	marker bit
	 *  5	(v) video bound
	 *  1   (p) packet rate restriction flag
	 *  1   marker bit
	 *  7	(r) reserved
	 *  3   (s) stuffing length (in bytes) max 7
	 *
	 * Bit Pattern 64 bits
	 * hhhh hhhh hhhh hhhh 1bbb bbbb bbbb bbbb
	 * bbbb bbb1 aaaa aafc xy1v vvvv prrr rrrr
	 */
	 
	 //Increment stream past system header we don't need it
	 stream.Forward(stream.Get16());
}

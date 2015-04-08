function PESPackage(){
	this.StartCode  = 0x000001;
	this.StreamID   = 0;
	this.Length		= 0;
	this.DataLength = 0;
	
	this.PESScramblingControl;
	this.PESPriority;
	this.DataAlignmentIndicator;
	this.Copyright;
	this.OriginalOrCopy;
	this.PTS_DTSFlags;
	this.ESCRFlag;
	this.ESRateFlag;
	this.DSMTrickModeFlag;
	this.AdditionalCopyInfoFlag;
	this.PES_CRCFlag;
	this.PESExtensionFlag;
	this.PESHeaderDataLength;
}

PESPackage.prototype.Destruct = function(){
	//Nothing to clean up
}

PESPackage.prototype.Read = function(stream){
	switch(stream.Get32()){
		case 0x000001BD: //Private Steam 1
			this.ReadPrivate1(stream);				
			return true;
		case 0x000001BE: //Padding Stream
			this.ReadPadding(stream);
			return true;
		default:			
			stream.Rewind32();
			return false;
	}	
}

//This section uses 3 bytes plus the number of bytes specified by PESHeaderDataLength
PESPackage.prototype.ReadPrivate1 = function(stream){
	this.StreamID = 0xBD;	
	this.Length   = stream.Get16();
	
	var data = stream.Get16();
	
	//Get flags from the first two bytes
	this.PESScramblingControl   = (data & 0x0300) >> 12;
	this.PESPriority		    = (data & 0x0800) >> 11;
	this.DataAlignmentIndicator = (data & 0x0400) >> 10;
	this.Copyright			    = (data & 0x0200) >>  9;
	this.OriginalOrCopy			= (data & 0x0100) >>  8;
	this.PTS_DTSFlags			= (data & 0x00C0) >>  6;
	this.ESCRFlag				= (data & 0x0020) >>  5;
	this.ESRateFlag				= (data & 0x0010) >>  4;
	this.DSMTrickModeFlag		= (data & 0x0008) >>  3;
	this.AdditionalCopyInfoFlag = (data & 0x0004) >>  2;
	this.PES_CRCFlag			= (data & 0x0002) >>  1;
	this.PESExtensionFlag		= (data & 0x0001);
	
	//Get pes header data length from one byte
	this.PESHeaderDataLength  = stream.Get8();
	
	//Compute payload length
	this.DataLength = this.Length - (3 + this.PESHeaderDataLength);
	
	//We could read these
	//but for now lets skip em
	stream.Forward(this.PESHeaderDataLength);
}

PESPackage.prototype.ReadPadding = function(stream){
	this.StreamID = 0xBE;
	this.Length   = stream.Get16();
	stream.Forward(this.Length);
}

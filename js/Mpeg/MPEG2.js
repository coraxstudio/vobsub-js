function MPEG2(data, offset){
	this.Stream = new MPEG2Stream(data, offset);
}

MPEG2.prototype.Destruct = function(){
	this.Stream.Destruct();	
	delete this.Stream;	
	delete this.Buffer;	
}

MPEG2.prototype.ProgramStream = function(){
	var ps = new PSPackage();
	if(!ps.Read(this.Stream)){
		return false;
	}
	
	var buffer = [];
	
	var pes = new PESPackage();
	while(pes.Read(this.Stream)){
		if(pes.StreamID === 0xBD){
			buffer.push(this.Stream.Slice(pes.DataLength));
		}
	}
	
	return buffer;
}

MPEG2.prototype.ReadSPU = function(){	
	var spu = new SPUPackage();
	do{
		var data = this.ProgramStream();
		if(!data || data.length == 0){
			return false;
		}
			
		for(var i = 0; i < data.length; i++){
			var array = new Uint8Array(data[i]);
			
			//verify that this is indeed a subtitle stream
			if((array[0] & 0x20) !== 0x20){
				return false;
			}
			
			//Read length from the first data pack (2bytes)
			if(i == 0 && spu.Length == 0){
				spu.Length = (array[1] << 8) | array[2];				
			}			
			spu.Buffer.Append(array.buffer.slice(1));
			
		}
	}while(spu.Length !== spu.Buffer.GetLength());
	
	return spu;
}

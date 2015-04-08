/**
 * BinaryLoader
 * Loads an url as binary and returns it as an arraybuffer
 */
function BinaryLoader(url){
	this.Url = url; 
}

BinaryLoader.prototype.Load = function(){
	var that = this;
	
	var request = new XMLHttpRequest();
	request.open("GET", this.Url, true);
	request.responseType = "arraybuffer";
	request.onload = function(event){
		var response = request.response;
		if(response){
			if(request.status == 200){
				that.OnLoad(response);
			}else{
				that.OnError("BinaryLoader - " + that.Url + " " + request.status); 
			}			
		}else{
			that.OnError("BinaryLoader - No response data for " + that.Url);
		}
	}
	request.send(null);
}

//Events
BinaryLoader.prototype.OnLoad = function(){}
BinaryLoader.prototype.OnError = function(){}
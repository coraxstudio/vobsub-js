/**
 * TextLoader
 * Loads an url as text 
 */
function TextLoader(url){
	this.Url = url; 
}

TextLoader.prototype.Load = function(){
	var that = this;
	
	var request = new XMLHttpRequest();
	request.open("GET", this.Url, true);
	request.responseType = "text";
	request.onload = function(event){
		var response = request.response;
		if(response){
			if(request.status == 200){
				that.OnLoad(response);
			}else{
				that.OnError("Textloader " + that.Url + " " + request.status);
			}			
		}else{
			that.OnError("TextLoader - No response data for " + that.Url);
		}
	}
	request.send(null);
}

TextLoader.prototype.OnLoad = function(response){	
}

TextLoader.prototype.OnError = function(error){
}
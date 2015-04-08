/**
 * Notes
 * the url to the idx and sub file should be specified trough a track element the browser wont be able to handle it but we will
 *
 */
var idxUrl  = "/vids/video/Frozen/swe.idx";
var subUrl  = "/vids/video/Frozen/swe.sub";

window.onload = function(){
	main();	
}

function main(){
	var vobsub = new VobSub(idxUrl, subUrl, "video");
	vobsub.OnError = function(error){console.log(error);}
	vobsub.OnReady = function(){
		console.log("ready");
		vobsub.Start();
	}
	vobsub.Load();
}
	

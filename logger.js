/**
*LOGGER File
**/
var fs = require('fs');
var errorLogfile = fs.createWriteStream('error.log', {flags: 'a'}); 
var loggerconfig={
	level:'debug'//error debug 
};

/*
记录日志
*/
exports.ERROR=function(err){
	if(err){
		var meta = '[' + new Date() + '] ' +err.stack  + '\n'; 
		 errorLogfile.write(meta);
	}
}
exports.debug=function(obj){
	if(loggerconfig.level==="debug" && obj!=null){
		console.log(obj);
	}
}

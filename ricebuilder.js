#!/usr/bin/node

fsWorker = require('fs');

const VERSION = "0.1.0a";

var cl = function() {
	for (var index = 0; index < arguments.length; index++) {
		console.log( "arg" + index + ": " + JSON.stringify(arguments[index]) );
		console.log("");
	}
}

var tokParser = function( tokenStrings, delimiter, mode, improved ) {
	let tokens = [];
	let accum  = "";
	let level  = 0;

	for (var index = 0; index < tokenStrings.length; index++) {
		let char = tokenStrings[index];

		if (char != delimiter) {
			accum = accum + char;
			if (char == "(")
				level++;
			if (char == ")")
				level--;
		} else 
			if (level == 0) {
				tokens.push( accum );
				accum = "";
			
				if (mode == 'check')
					return true;
			} else {
				accum = accum + char;
			}
	}
	
	if (accum != "")
		tokens.push(accum);

	if (mode == 'check')
		return false;
	
	return tokens
		.map( function(token){
			if (isFunc(token))
				return splitFunc(token.trim());
			else
				return token.trim();
		});
};

var isFunc = function(token) {
	if (token.indexOf("(") != -1)
		return true;
	else
		return false;
}

var splitFunc = function(token) {
	let key  = "";
	let body = "";
	let level = 0;

	for (var index = 0; index < token.length; index++) {
		let char = token[index];

		if ( (char != "(") && (char != ")") ) {
			if (level == 0) 
				key = key + char;
			else
				body = body + char;
		} else {
			if (char == "(") {
				level++;
				if (level > 1)
					body = body + char;
			}
			if (char == ")") {
				level--;	
				if (level > 0)
					body = body + char;	
			}
		}

	}

	if (tokParser(body, ",", "check"))
		body = tokParser(body, ",");
	else
		body = [body];

	body = body.map(function(parsedToken){
		if (tokParser(parsedToken, "+", "check"))
			return tokParser(parsedToken, "+");
		else
			return parsedToken;
	});

	return {key: key, body: body};

}

function readArg(argKey) {
	let ret = '';

	process.argv.forEach(function (arg) {
	  if (arg.indexOf(argKey + '=') != -1)
	  	ret = arg.split('=')[1];
	});

	return ret;
}

function loadThemeConf(themeName) {
	return JSON.parse(
		fsWorker
			.readFileSync(themeName + '/conf.json')
			.toString()
	);
}

// Functional

let themeName  = readArg('theme');
let themeConf  = loadThemeConf(themeName);
let themeLogic = tokParser( themeConf.resultString, "+" );

cl(themeLogic)
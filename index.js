#! /usr/bin/env node
const generator = {name:"ojof-transformer", v:"0.0.0", date:"2018-05-29"}
const cliArgs = require('minimist')(process.argv.slice(
		process.argv[0]=="ojof"
		?1 //e.g. dot-cli --bla
		:2 //e.g. node index.js --bla
	))
const glob = require("glob")
const fs = require("fs")
const path = require("path")
const peg = require("pegjs")
const util = require("util")
const lookmlParser = require('lookml-parser')
const read = f => fs.readFileSync(f,{encoding:'utf-8'})

const dot = require("dot")
dot.templateSettings = {
		evaluate:    /\<\<\!([\s\S]+?)\>\>/g,
		interpolate: /\<\<\:([\s\S]+?)\>\>/g,
		encode:      /\<\<&([\s\S]+?)\>\>/g,
		use:         /\<\<#([\s\S]+?)\>\>/g,
		define:      /\<\<##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\>\>/g,
		conditional: /\<\<\?(\?)?\s*([\s\S]*?)\s*\>\>/g,
		iterate:     /\<\<\*\s*(?:\>\>|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\>\>)/g,
		varname: 'x',
		strip: false,
		append: true,
		selfcontained: false
	};
const orion = dot.template(read(path.join(__dirname,"orion.dot")))
const flatten = (a,b) => a.concat(b)
const fatalParseErrors = true
const directory = cliArgs.input || cliArgs.i || "."
const source = directory + "/*.view.lkml"
!async function(){
const parsed = await lookmlParser.parseFiles({
		source, console,
		conditionalCommentString: "ORION"
	})
const views = parsed.files.map(f=>f.views).reduce(flatten,[])
if(!views.length){
		if(directory=='.'){console.warn("Warning: No views were found in the current directory. Use --input=path/to/dir")}
		else{console.warn("Warning: No views were found in directory "+directory)}
	}
console.log(orion({views, generator}))
}()
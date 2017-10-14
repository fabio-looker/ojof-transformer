#! /usr/bin/env node

const cliArgs = require('minimist')(process.argv.slice(
		process.argv[0]=="dot-cli"
		?1 //e.g. dot-cli --bla
		:2 //e.g. node index.js --bla
	))
const glob = require("glob")
const fs = require("fs")
const path = require("path")
const peg = require("pegjs")

const inputGlob = cliArgs.input || cliArgs.i || "*.view.lkml"
const globOptions = {} //cliArgs
const read = f => fs.readFileSync(f,{encoding:'utf-8'})

const lookmlParser = peg.generate(read(path.join(__dirname,"lookml.peg")))
 
const inputFiles=glob.sync(inputGlob,globOptions)

if(!inputFiles.length){console.warn("Warning: No input files were matched. (Use argument --input=... )")}

const viewSet = inputFiles.reduce((set,file,f)=>{
		try{
				return Object.assign(set,lookmlParser.parse(read(file)).view)
			}catch(e){
				throw [
					e.name || "Parsing error",
					"File:     "+file,
					"Position: "+JSON.stringify(e.location && e.location.start),
					"Error:    "+e.message
				].join("\n> ")
			}
		},{})

console.log(Object.keys(viewSet))
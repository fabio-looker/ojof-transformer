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

const inputPath = cliArgs.input || cliArgs.i || "."
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
const inputFiles=glob.sync(inputPath+"/*.view.lkml")
const flatten = (a,b) => a.concat(b)
const fatalParseErrors = true

if(!inputFiles.length){console.warn("Warning: No views were found. (Provide directory to argument --input=... )")}

const model = inputFiles.map((file,f)=>{
				try{
						return lookmlParser.parse(
								read(file)
								//TODO: Use the new conditional comments feature instead
								.replace(
										/(\n|^)\s*#ORION[ \t]*((\n\s*#[^\n]*)*)/g,
										(full,start,block)=>block.replace(/\n\s*#/g,"\n")
									)
							)
					}
				catch(e){
						const o = {
							error: e.name || "Parsing error",
							file:    file,
							position:JSON.stringify(e.location && e.location.start),
							message: e.message
						}
						if(fatalParseErrors){console.error(o);throw o.error}else{return {errors:[o]}}
					}
			})
		.reduce((set,file,f)=>({
				view:{...set.view, ...file.view},
				views:set.views.concat(file.views),
				errors:set.errors.concat(file.errors||[])
			}),{view:{},views:[],errors:[]})

console.log(orion({...model, generator}))

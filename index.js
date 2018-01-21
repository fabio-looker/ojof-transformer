#! /usr/bin/env node
const generator = {name:"ojof-transformer", v:"0.0.1", date:"2017-12-10"}
const cliArgs = require('minimist')(process.argv.slice(
		process.argv[0]=="ojof"
		?1 //e.g. dot-cli --bla
		:2 //e.g. node index.js --bla
	))
const glob = require("glob")
const fs = require("fs")
const path = require("path")
const peg = require("pegjs")
const dot = require("dot")
const util = require("util")
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

const inputGlob = cliArgs.input || cliArgs.i || "*.view.lkml"
const globOptions = {} //cliArgs
const read = f => fs.readFileSync(f,{encoding:'utf-8'})
const readPkg = f => read(path.join(__dirname,f))
const lookmlParser = peg.generate(readPkg("lookml.peg"))
//const build = dot.template(readPkg("template.dot"))
const inputFiles=glob.sync(inputGlob,globOptions)
const flatten = (a,b) => a.concat(b)
const fatalParseErrors = true

if(!inputFiles.length){console.warn("Warning: No input files were matched. (Use argument --input=... )")}

const model = inputFiles.map((file,f)=>{
				try{
						return lookmlParser.parse(
								read(file)
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
				view:Object.assign({}, set.view,file.view),
				views:set.views.concat(file.views),
				errors:set.errors.concat(file.errors||[])
			}),{view:{},views:[],errors:[]})
		
//const singleColRegex=/^[_a-zA-Z][_a-zA-Z0-9$]*$|^"[^"]+"$/
// const explore = {
// 		name:"ojof",
// 		label:"All the things",
// 		other:""
// 	}
// const transformed = Object.assign({
// 		generator,
// 		explore,
// 		views:Object.entries(viewObjs)
// 				.map(([v,view],vi)=>Object.assign({},view,{
// 						n:vi,
// 						name: lookmlName(v)+"_v"+vi,
// 						mName:lookmlName(v)+"_v"+vi+"_msr",
// 						dName:lookmlName(v)+"_v"+vi+"_dim"
// 					}))
// 				.map((v,vi)=>Object.assign({},v,{
// 						dimensions:[
// 							//#CONTINUE
// 
// 
// 							].reduce(flatten,[]),
// 						measures:[
// 
// 
// 							].reduce(flatten,[])
// 					))
// 						v.fields.map((f,fi)=>Object.assign({},f,{
// 								n:fi,
// 								viewName:v.name,
// 								name:lookmlName(f.label)+"_"+fi,
// 								dim:f.dim /*~f.modes.indexOf("dim")*/ && f.type!="date",
// 								ddg:f.dim /*~f.modes.indexOf("dim")*/ && f.type=="date",
// 								codim:f.codim?lookmlName(f.codim):undefined,
// 								sql:(f.sql||'').match(singleColRegex)
// 									?"${TABLE}."+f.sql
// 									:f.sql
// 							})).map((f,fi)=>Object.assign({},f,{
// 								sqlInner:f.sql.replace(/\$\{TABLE\}/g, v.name),
// 								sqlMsr:f.sql.replace(/\$\{TABLE\}/g, "${msr}"),
// 								sqlDim:f.sql.replace(/\$\{TABLE\}/g, "${dim}"),
// 								sqlDimWeak:f.sql.replace(/\$\{TABLE\}/g, "${ojof."+v.dName+"}")
// 							}))
// 					}))
// 			,
// 		normalizedRelationships:x.normalizedRelationships.map((r,ri)=>Object.assign({},r,{
// 				leftViewName:lookmlName(r.leftViewName),
// 				rightViewName:lookmlName(r.rightViewName),
// 			})),
// 		codims:x.codims.map((c,ci)=>Object.assign({},c,{
// 				codim:true,
// 				n:ci,
// 				name:lookmlName(c.label)+"_c"+ci,
// 				dName:lookmlName(c.label)+"_c"+ci
// 			}))
// 	});
// 
// 
// const normalizedRelationships = views.map(view =>
// 		(view.foreign_keys||[]).map( fk => Object.assign({},fk,{
// 					leftViewName: view._name,
// 					rightViewName: fk.for
// 			}))
// 	).reduce(flatten,[])
// 
// const codims = views
// 		.map(view => view.dimensions.concat(view.dimension_groups)
// 				.filter(d=>d.codimension)
// 				.map(d=>Object.assign({},d,{_view:view._name}))
// 			)
// 		.reduce(flatten,[])

//const model = { generator, views, normalizedRelationships, codims, connectionName:""}
//const out = build({view:views})
//console.log("`model`, `out` available for inspection")
console.log("`model` available for inspection")

// Interactive testing for development...
const repl = require("repl")
const r = repl.start({writer:x=>
		util
		.inspect(x,{depth:1,colors:true})
		.replace(/: "([^"]{60})[^"]+"/,': "$1..."')
	})
r.context.model = model
//r.context.build = ()=>build(model)

#!/usr/bin/env node

const FS     = require('fs')
const globby = require('globby')
const args = require('yargs').argv
let translateTo = args.translateTo || ''

const r1 = /^(let|var|const) +([a-zA-Z_$][a-zA-Z0-9_$]*) +\= +(require)\((('|")[a-zA-Z0-9-_.\/]+('|"))\)/gm // const createStore = require('redux')
const r2 = /^(let|var|const) +([a-zA-Z_$][a-zA-Z0-9_$]*) +\= +(require)\((('|")[a-zA-Z0-9-_.\/]+('|"))\)\.([a-zA-Z][a-zA-Z0-9]+)/gm // const createStore = require('redux').createStore
const r3 = /^(let|var|const) +(\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}) +\= +(require)\((('|")[a-zA-Z0-9-_.\/]+('|"))\)/gm // const { createStore } = require('redux')
const r4 = /^(import) +([a-zA-Z_$][a-zA-Z0-9_$]*) +(from) (('|")[a-zA-Z0-9-_.\/]+('|"))/gm // import t from 'express'
const r5 = /^(import) +(\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}) +(from) (('|")[a-zA-Z0-9-_.\/]+('|"))/gm // import {a} from 'express'
if (!args.path || !translateTo) {
  console.error('you need path and translateTo "\n')
  process.exit(1)
}

function replaceToEs6(fp) {
	const result = FS.writeFileSync(fp, FS.readFileSync(fp, 'utf-8')
    .replace(r3, `import { $3 } from $5`)
    .replace(r2, `import { $7 as $2 } from $4`)
    .replace(r1, `import $2 from $4`), 'utf-8')
  console.log(`> ${fp}`)
  return result
}
function replaceToCommonRequire(fp) {
	const result = FS.writeFileSync(fp, FS.readFileSync(fp, 'utf-8')
		.replace(r4, `const $2 = require($4)`)
		.replace(r5, `const {$3} = require($5)`)
	)
  console.log(`> ${fp}`)
  return result
}
const paths = globby.sync(args.path)

paths.forEach(function (p) {
  if (!FS.statSync(p).isDirectory()) {
		if (translateTo === 'commonJs') {
			return replaceToCommonRequire(p)
		} else if (translateTo === 'es6') {
			return replaceToEs6(p)
		} else {
			console.error('not suit module "\n')
			process.exit(1)
		}
  } else {
		console.error('path need Dirction')
	}
})

console.info('Done!\n')
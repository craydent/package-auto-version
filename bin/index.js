#!/usr/bin/env node
const $c = require('craydent/global');
const pkg = require('../package.json');
const utils = require('../utils/utils');
const { start } = require('../utils/start');
$c.DEBUG_MODE = true;

const options = [{
	option: "-c,--changelog",
	type: "string",
	default: "./CHANGELOG.md",
	description: "relative path to the [c]hangelog file (default: ./CHANGELOG.md)."
}, {
	option: "-t,--changelogTemplate",
	type: "string",
	default: "./changelogTemplate.md",
	description: "relative path to the [t]emplate file to use for the changelog entries (default: ./changelogTemplate.md)."
}, {
	option: "-p,--promptTemplate",
	type: "string",
	default: "./promptTemplate.md",
	description: "relative path to the [p]rompt template file to use when prompting the user  (default: ./promptTemplate.md)."
}, {
	option: "-r,--transform",
	type: "string",
	description: "specify middleware to inject to transform the changelog entry."
}, {
	option: "-e,--versions",
	type: "string",
	default: "patch",
	description: "specify comma separated list of versions to update the changelog  (major | minor | (default) patch | premajor | preminor | prepatch | prerelease | from-git)."
}, {
	option: "-o,--config",
	type: "string",
	description: "specify a config file to use instead of using command line options."
}, {
	option: "-v,--version",
	type: "string",
	description: "indicates the current [v]ersion of Package auto version."
}];
var CL = new $c.CLI({
	name: "Package auto version",
	synopsis: "Command line interface to auto generate changelog entries and increment the package.json version.",
	description: "This CLI generate entries in the changelog based on git commits as well as update the package.json version field based on the input provided."
});

if (CL.isMan) {
	console.log(CL.renderMan());
	return process.exit();
}
if (CL.isHelp) {
	console.log(CL.renderHelp());
	return process.exit();
}

CL.command("version  \t- indicates the current version of Package auto version.")
	.action(version);

CL
	.command("completion", options)
	.action(completion)

CL
	.command("major", options)
	.action(init)
	.command("minor", options)
	.action(init)
	.command("patch", options)
	.action(init)
	.command("premajor", options)
	.action(init)
	.command("preminor", options)
	.action(init)
	.command("prepatch", options)
	.action(init)
	.command("prerelease", options)
	.action(init)
	.command("from-git", options)
	.action(init)
	.command("*", options)
	.action(init)
	.action(version);

function version() {
	if (CL.CommandName == "version" || CL.version === true) {
		console.log(pkg.version);
		return process.exit();
	}
}
function completion() {
	if (CL.CommandName == "completion") {
		let fs = require('fs');
		console.log();
		console.log(fs.readFileSync(`${__dirname}/completion.sh`,'utf8'));
		return process.exit();
	}
}
async function init() {
	if (CL.version === true) { return; }
	utils.setConfig({
		version: CL.CommandName == "*" ? "patch" : CL.CommandName,
		changelogTemplate: CL.t,
		promptTemplate: CL.p,
		transform: CL.r,
		versions: CL.e,
		changelog: CL.c,
		config: CL.o
	});
	await start()
	// process.exit();
}
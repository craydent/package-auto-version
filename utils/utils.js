const $c = require('craydent');
const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const readline = require('readline'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
const question = $c.yieldable(rl.question, rl)
const exec = $c.CLI.exec;
let version = process.argv[2] || 'patch';
const package = $c.include(path.join(cwd, './package.json')) || {};
const defaultConfig = {
    changelog: './CHANGELOG.md',
    changelogTemplate: './changelogTemplate.md',
    promptTemplate: './promptTemplate.md',
    noPrompt: false,
    date: 'm/d/y',
    tags: [],
    versions: [],
    transform: '',
    transformGitMessage: '',
    transformAuthor: ''
}
let config = $c.merge(defaultConfig, package.pav);
let changelog = config.changelog = absolutePath(config.changelog);
let template = config.changelogTemplate = absolutePath(config.changelogTemplate);
let promptTemplate = config.promptTemplate = absolutePath(config.promptTemplate);
const defaultChanglogTemplate = '| ${version} | (${author}:${date}) ${others.0} |\n';
const defaultPromptTemplate = `**********************************************************************\n\${message}\n**********************************************************************\nThis will be your git message. Please enter your text to change\n`
const silent = { silent: true, alwaysResolve: true };
const GITDATA = 0, CHANGELOG = 1, CHANGELOG_TEMPLATE = 2, VERSION = 3, PROMPT_TEMPLATE = 4;
const RED = '\x1b[31m%s\x1b[0m',
    GREEN = '\x1b[32m%s\x1b[0m',
    YELLOW = '\x1b[33m%s\x1b[0m';
let transform = include(config.transform) || { transform: m => m };
let transformGitMessage = include(config.transformGitMessage) || { transformGitMessage: m => m };
let transformAuthor = include(config.transformAuthor) || { transformAuthor: m => m };
config.middleware = $c.merge(transform, transformGitMessage, transformAuthor);
let updateChangelog = !!~config.versions.indexOf(version) || !config.versions.length;
let match = include(config.match);
if ($c.isString(config.match) && !match) {
    config.match = new RegExp(config.match);
} else if (match) {
    config.match = $c.isRegExp(match) ? match : new RegExp(match)
}

function absolutePath(pathStr) {
    pathStr = pathStr || "";
    if (!pathStr.indexOf('./')) {
        return path.join(cwd, pathStr);
    }
    if (~pathStr.indexOf('<rootDir>')) {
        return pathStr.replace('<rootDir>', cwd);
    }
    if (pathStr[0] == '/' && pathStr.indexOf(cwd)) {
        return cwd + pathStr;
    }
    return pathStr;
}

function include(mod){
    if (!mod) {
        return false;
    }
    let pth = absolutePath(mod);
    try {
        return $c.include(pth) || fs.readFileSync(pth, 'utf8');
    } catch (e) {
        return false;
    }
}
async function includeAsync(mod){
    if (!mod) {
        return false;
    }
    let pth = absolutePath(mod);
    try {
        return $c.include(pth) || $c.readFile(pth, 'utf8');
    } catch (e) {
        return false;
    }
}

async function generateMessage(template, data) {
    let message = $c.fillTemplate(template, data);
    if (config.middleware.transform) {
        message = config.middleware.transform(message, data);
        if (message.constructor.name === 'Promise') {
            return await message;
        }
    }
    return message;
}
async function parseGitCommits() {
    const gitUsername = await exec('git config user.name', silent);
    const gitOutput = await exec(`git log origin..HEAD --oneline`, silent);
    var features = [],
        fixes = [],
        merges = [],
        docs = [],
        others = [],
        tags ={};
    for (let i = 0, len = config.tags.length; i < len; i++) {
        let tag = config.tags[i];
        let name = $c.strip((tag || "").toString(),['/',':']);
        if (!$c.isRegExp(tag)) {
            config.tags = new RegExp(tag);
        }
        tags[name]=[];
    }
    const transformGitMessage = config.middleware.transformGitMessage.bind(config.middleware);
    const gitLines = gitOutput.output.split('\n')
        .condense()
        .map(x => {
            let message = x.replace(/.*?\s/, '').trim();
            if (!message.indexOf('feat:')) {
                features.push(message.replace(/feat:\s*?/, '').trim());
                return transformGitMessage(message);
            }
            if (!message.indexOf('fix:')) {
                fixes.push(message.replace(/fix:\s*?/, '').trim());
                return transformGitMessage(message);
            }
            if (!message.indexOf('docs:')) {
                docs.push(message.replace(/docs:\s*?/, '').trim());
                return transformGitMessage(message);
            }
            if (!message.indexOf("Merge branch '")) {
                merges.push(message);
                return transformGitMessage(message);
            }
            let tag = "";
            if (tag = [message].contains(config.tags)) {
                let name = $c.strip((tag || "").toString(),['/',':']);
                tags[name].push(message.replace(tag, '').trim());
                return transformGitMessage(message);
            }

            others.push(message);
            return transformGitMessage(message);
        });

    const author = config.middleware.transformAuthor(gitUsername.output.strip('\n').trim());
    const date = $c.now(config.date || 'm/d/y');

    return { author, date, features, fixes, docs, merges, others, gitLines };
}
async function updateVersion() {
    const versionObject = await exec(`npm version ${version}`, silent);
    const output = versionObject.output || "";
    if (!/^v\d+?\.\d+?\.\d+?/.test(output)) {
        console.log(RED, output);
        process.exit(1);
    }
    return output.strip(['v', '\n']);
}
async function getData() {
    const results = await Promise.all([
        parseGitCommits(),
        includeAsync(changelog),
        includeAsync(template),
        updateVersion(),
        includeAsync(promptTemplate)
    ]);

    let data = results[GITDATA];
    let content = !$c.isError(results[CHANGELOG]) ? results[CHANGELOG] : '';
    let changelogTemplateStr = !$c.isError(results[CHANGELOG_TEMPLATE])
        ? results[CHANGELOG_TEMPLATE]
        : defaultChanglogTemplate;
    let promptTemplateStr = !$c.isError(results[PROMPT_TEMPLATE])
        ? results[PROMPT_TEMPLATE]
        : defaultPromptTemplate;
    let versionNumber = results[VERSION];

    data.version = versionNumber;
    return { data, content, changelogTemplateStr, promptTemplateStr }
}
function setConfig(conf) {
    let tempConfig = {};
    if ($c.isString(package.pav)) {
        package.pav = include(package.pav);
    }
    if ($c.isString(config.config)) {
        tempConfig = include(config.config) || $c.tryEval(config.config, JSON.parse) || {};
    }
    config = $c.merge(defaultConfig, package.pav, tempConfig, conf);

    let match = include(config.match);
    if ($c.isString(config.match) && !match) {
        config.match = new RegExp(config.match);
    } else if (match) {
        config.match = $c.isRegExp(match) ? match : new RegExp(match)
    }
    version = conf.version || 'patch';
    template = config.changelogTemplate = absolutePath(config.changelogTemplate);
    promptTemplate = config.promptTemplate = absolutePath(config.promptTemplate);

    let transform = include(config.transform) || { transform: m => m };
    let transformGitMessage = include(config.transformGitMessage) || { transformGitMessage: m => m };
    let transformAuthor = include(config.transformAuthor) || { transformAuthor: m => m };
    config.middleware = $c.merge(transform, transformGitMessage, transformAuthor);

    if ($c.isString(config.versions)) {
        config.versions = config.versions.split(',');
    }
    if ($c.isString(config.tags)) {
        config.tags = config.tags.split(',');
    }

    module.exports.config = config;
    module.exports.changelog = config.changelog = absolutePath(config.changelog);
    module.exports.updateChangelog = !!~config.versions.indexOf(version) || !config.versions.length;

}
module.exports.generateMessage = generateMessage;
module.exports.getData = getData;
module.exports.setConfig = setConfig;

module.exports.changelog = changelog;
module.exports.config = config;
module.exports.question = question;
module.exports.updateChangelog = updateChangelog;

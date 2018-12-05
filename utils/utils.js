const $c = require('craydent');
const path = require('path');
const readline = require('readline'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
const question = $c.yieldable(rl.question, rl)
const exec = $c.CLI.exec;
let version = process.argv[2] || 'patch';
const package = $c.include(path.join(process.cwd(), './package.json')) || {};
const defaultConfig = {
    changelog: './CHANGELOG.md',
    changelogTemplate: './changelogTemplate.md',
    promptTemplate: './promptTemplate.md',
    versions: [],
    transform: '',
    transformGitMessage: '',
    transformAuthor: ''
}
let config = $c.merge(defaultConfig, package.pav);
let changelog = path.join(process.cwd(), config.changelog);
let template = path.join(process.cwd(), config.changelogTemplate);
let promptTemplate = path.join(process.cwd(), config.promptTemplate);
const defaultChanglogTemplate = `| \${version} | (\${author}:\${date}) \${others.0} |\n`;
const defaultPromptTemplate = `**********************************************************************\n\${message}\n**********************************************************************\nThis will be your git message. Please enter your text to change\n`
const silent = { silent: true, alwaysResolve: true };
const GITDATA = 0, CHANGELOG = 1, CHANGELOG_TEMPLATE = 2, VERSION = 3, PROMPT_TEMPLATE = 4;
const RED = '\x1b[31m%s\x1b[0m',
    GREEN = '\x1b[32m%s\x1b[0m',
    YELLOW = '\x1b[33m%s\x1b[0m';
let transform = $c.include(config.transform) || { transform: m => m };
let transformGitMessage = $c.include(config.transformGitMessage) || { transformGitMessage: m => m };
let transformAuthor = $c.include(config.transformAuthor) || { transformAuthor: m => m };
config.middleware = $c.merge(transform, transformGitMessage, transformAuthor);
let updateChangelog = !!~config.versions.indexOf(version) || !config.versions.length;

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
        others = [];
    const transformGitMessage = config.middleware.transformGitMessage.bind(config.middleware);
    const gitLines = gitOutput.output.split('\n')
        .condense()
        .map(x => {
            let message = x.replace(/.*?\s/, '');
            if (!message.indexOf('feat:')) {
                features.push(message.replace(/feat:\s*?/, ''));
                return transformGitMessage(message);
            }
            if (!message.indexOf('fix:')) {
                fixes.push(message.replace(/fix:\s*?/, ''));
                return transformGitMessage(message);
            }
            if (!message.indexOf('docs:')) {
                docs.push(message.replace(/docs:\s*?/, ''));
                return transformGitMessage(message);
            }
            if (!message.indexOf("Merge branch '")) {
                merges.push(message);
                return transformGitMessage(message);
            }

            others.push(message);
            return transformGitMessage(message);
        });

    const author = config.middleware.transformAuthor(gitUsername.output.strip('\n').trim());
    const date = $c.now('m/d/y');

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
        $c.readFile(changelog, 'utf8'),
        $c.readFile(template, 'utf8'),
        updateVersion(),
        $c.readFile(promptTemplate, 'utf8')
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
        package.pav = $c.include(package.pav);
    }
    if ($c.isString(config.config)) {
        tempConfig = $c.include(config.config) || $c.tryEval(config.config, JSON.parse) || {};
    }
    config = $c.merge(defaultConfig, package.pav, tempConfig, conf);
    version = conf.version || 'patch';
    template = path.join(process.cwd(), config.changelogTemplate);
    promptTemplate = path.join(process.cwd(), config.promptTemplate);

    let transform = $c.include(config.transform || "") || { transform: m => m };
    let transformGitMessage = $c.include(config.transformGitMessage || "") || { transformGitMessage: m => m };
    let transformAuthor = $c.include(config.transformAuthor || "") || { transformAuthor: m => m };
    config.middleware = $c.merge(transform, transformGitMessage, transformAuthor);

    if ($c.isString(config.versions)) {
        config.versions = config.versions.split(',');
    }

    module.exports.config = config;
    module.exports.changelog = path.join(process.cwd(), config.changelog);
    module.exports.updateChangelog = !!~config.versions.indexOf(version) || !config.versions.length;

}
module.exports.generateMessage = generateMessage;
module.exports.getData = getData;
module.exports.setConfig = setConfig;

module.exports.changelog = changelog;
module.exports.config = config;
module.exports.question = question;
module.exports.updateChangelog = updateChangelog;

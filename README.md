<img src="http://craydent.com/JsonObjectEditor/img/svgs/craydent-logo.svg" width=75 height=75/>

# Package Auto Version
**by Clark Inada**

This module is a reverse proxy server implemented in node.  There are 2 ways to use: global install/standalone or as a module.  When used as a standalone, a config file is create in /var/craydent/config/craydent-proxy/pconfig.json and will auto update the routes if the file is changed.  This happens as well when used as a module and a file is provided as a config.  This eliminates the need to restart the server for a configuration and/or route update.

## Standalone
```shell
$ npm install -g package-auto-version
$ pav
```

## Node.js module
```shell
$ npm i --save package-auto-version
```

### CLI

#### Version

```shell
$ pav version;
$ pav --version;
$ pav -v;
```

pav version takes no arguments.  This will output the current verion of the module.

#### Completion

```shell
$ pav completion;
```

pav completion takes no arguments.  This will output the completion script which is used for tab completion.

#### Man

```shell
$ pav man;
```

pav man takes no arguments.  This will output the manual.

#### Help

```shell
$ pav help;
$ pav --help;
```

pav --help/help will output the current help docs for the module.

#### Usage

```shell
$ pav {{./path/to/CHANGELOG.md}} {{./path/to/changelogTemplate.md}} {{./path/to/promptTemplate.md}} {{module/or/path/to/transform/file}} {{module/or/path/to/transformAuthor/file}} {{module/or/path/to/transformGitMessage/file}} '{{patch,minor,major,etc}}' {{/var/path/to/config.json}}

$ pav -c {{./path/to/CHANGELOG.md}} -t {{./path/to/changelogTemplate.md}} -p {{./path/to/promptTemplate.md}} -r {{module/or/path/to/transform/file}} -a {{module/or/path/to/transformAuthor/file}} -i {{module/or/path/to/transformGitMessage/file}} -e '{{patch,minor,major,etc}}' -o {{/var/path/to/config.json}}

$ pav --changelog {{./path/to/CHANGELOG.md}} --changelogTemplate {{./path/to/changelogTemplate.md}} --promptTemplate {{./path/to/promptTemplate.md}} --transform {{module/or/path/to/transform/file}} --transformAuthor {{module/or/path/to/transformAuthor/file}} --transformGitMessage {{module/or/path/to/transformGitMessage/file}} --versions '{{patch,minor,major,etc}}' --config {{/var/path/to/config.json}}
```

"-c,--changelog"
	default: "./CHANGELOG.md"
"-t,--changelogTemplate",
	default: "./changelogTemplate.md",
"-p,--promptTemplate",
	default: "./promptTemplate.md",
"-r,--transform",
"-a,--transformAuthor",
"-i,--transformGitMessage",
"-e,--versions",
	default: "patch",
	description: "specify comma separated list of versions to update the changelog  (major | minor | (default) patch | premajor | preminor | prepatch | prerelease | from-git)."
"-o,--config"
pav can take up to 6 arguments: changelog, changelogTemplate, promptTemplate, transform (module or file path), versions (comma separated list of major | minor | (default) patch | premajor | preminor | prepatch | prerelease | from-git), config (file path).  When arguments are missing, the CLI will use default values.

1. changelog - changelog file (relative file path).(default is ./CHANGELOG.md) (-c,--changelog)
2. changelogTemplate - changelog template file (relative file path).(default is ./changelogTemplate.md) (-t,--changelogTemplate)
3. promptTemplate - prompt message template file (relative file path).(default is ./promptTemplate.md) (-p,--promptTemplate)
4. transform - module or file to run a transformation when creating the changelog entry. (-r,--tranform)
4. transformAuthor - module or file to run a transformation when parsing the author field. (-a,--tranformAuthor)
4. transformGitMessage - module or file to run a transformation when parsing the git message. (-i,--tranformGitMessage)
5. versions - Comma delimited list of semver version types. (default is "major,minor,patch,premajor,preminor,prepatch,prerelease,from-git") (-e,--versions)
6. config - config file (file path). (-o,--config)

```js
// example config file when using the config option or if you set the property pav in the package.json
{
    "changelogTemplate": "./changelogTemplate.md",
    "promptTemplate": "./promptTemplate.md",
    "transform": "",
    "transformAuthor": "",
    "transformGitMessage": "",
    "versions": "minor,major",
    "changelog": "./CHANGELOG.md"
}
```

#### Example Templates
Prompt template:
```
***\n\${message}\n***\nThis will be your git message. Please enter your text to change\n
```

Changelog template:
```
| ${version} | (${author}:\${date}) '${others.0}' ${FOREACH ${other} in ${others}}${other}${END FOREACH} |\n
```

## Download

 * [GitHub](https://github.com/cinada/package-auto-version)
 * [BitBucket](https://bitbucket.org/cinada/package-auto-version)
 * [GitLab](https://gitlab.com/cinada/package-auto-version)

Package-Auto-Version is released under the [Dual licensed under the MIT or GPL Version 2 licenses].<br>
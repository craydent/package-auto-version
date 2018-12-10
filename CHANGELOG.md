# Changelog

## [1.2.6] - 12/10/18



#### Fixes
- issue when match is undefined in the bin




## [1.2.5] - 12/10/18



#### Fixes
- fixing issue when match is not defined




## [1.2.4] - 12/07/18



#### Fixes
- Consumable  templates were using relative path




## [1.2.3] - 12/07/18



#### Fixes
- ./simple can not be referenced when running as a module.




## [1.2.2] - 12/07/18

#### Docs
- Update README to showcase <rootDir> and added documentation


#### Features
- Added consumable matchAdded support for modules for changelogs/templates/matchAdded consumable templates




#### Other
- Updated package.json pav config to use <rootDir> and modulesMoved and renamed template.md


## [1.2.1] - 12/06/18



#### Fixes
- Update git downloads to the correct url in the README.




## [1.2.0] - 12/06/18
#### Docs
- Added configuration to package.json.
- Created template.md to use for the CHANGELOG.
- Added match as an option to account for complicated templates that cannot be matched by taking the shell of the template.
- Added match to the CLI.
- Respect match option in creating the CHANGELOG entry.
- Updated README with usage for match.
- Added script in package.json to run the current CLI for pav.

#### Fixes
- Added noPrompt and date to the CLI options.
- Respect the date format in the CHANGELOG.
- Fixed issue -> when the CHANGELOG is empty/pattern is not found, changelog was not generating.
- Fixed template syntax to use the variables instead of the hardcoded string.
- Removed leading and trailing white space in the messages.


## [1.0.1] - 12/06/18
#### Docs
- Created CHANGELOG.md.
- Added missing example templates in the README.
- Updated README with latest features.
- Updated README with information about the data being passed to the templates.



#### Features
- Added date format to be configurable.



#### Fixes
- Made noPrompt to be configurable.





## [1.0.0] - 12/05/18
#### Docs
- Complete and published v1.







const fs = require('fs');
module.exports = fs.readFileSync(`${__dirname}/templates/git-documentation.md`, 'utf8');
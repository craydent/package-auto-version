const fs = require('fs');
module.exports = fs.readFileSync(`${__dirname}/templates/simple.md`, 'utf8');
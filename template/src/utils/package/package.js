const pkg = require('../../../package.json');

const binName = Object.keys(pkg.bin)[0];
const packageName = pkg.name;
const packageVersion = pkg.version;
const packageDescription = pkg.description;

module.exports.binName = binName;
module.exports.packageName = packageName;
module.exports.packageVersion = packageVersion;
module.exports.packageDescription = packageDescription;
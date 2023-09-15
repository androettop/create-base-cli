const { packageVersion, packageDescription } = require('../../utils/package/package');
const { another } = require('../sample_set');
const sample = require('./sample');

const commandSet = {
	description: `${packageDescription} (v${packageVersion})`,
	commands: [
		{
			name: 'sample',
			description: 'Sample command',
			fn: sample
		},
		// Command aliases are supported
		{  ...another, name: 'alias' },
		// Nested command sets
		{
			name: 'sample-set',
			load_dynamically_from: 'sample_set'
		}
	]
};

module.exports = commandSet;

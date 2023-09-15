const anotherFn = require('./another');

const another = {
	name: 'another',
	description: 'Another sample command',
	fn: anotherFn
};

const commandSet = {
	description: `This is a sample command set`,
	commands: [another]
};

module.exports = commandSet;

module.exports.another = another;

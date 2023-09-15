const omelette = require('omelette');
const { getCommandSets } = require('../commands/registerCommandSet');
const buildCompletionTree = require('./buildCompletionTree');
const { binName } = require('../package/package');

module.exports = {
	init: async () => {
		const { main_set: mainSet } = getCommandSets();
		omelette(binName).tree(buildCompletionTree(mainSet)).init();
	},
	setup: () => {
		omelette(binName).setupShellInitFile();
		process.exit(0);
	},
	cleanup: () => {
		omelette(binName).cleanupShellInitFile();
		process.exit(0);
	}
};

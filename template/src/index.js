#!/usr/bin/env node

const { isJustUpdated } = require('./utils/cli/postInstall');
const { executePostInstallScript } = require('./utils/cli/postInstall');

if (isJustUpdated()) {
	executePostInstallScript();
} else {
	const {
		registerCommandSet
	} = require('./utils/commands/registerCommandSet');

	const mainSet = require('./command_sets/main');
	const sampleSet = require('./command_sets/sample_set');

	const completion = require('./utils/completion');
	const runCommand = require('./utils/commands/runCommand');
	const init = require('./utils/init');

	/* Command sets registration */
	registerCommandSet('main_set', mainSet);
	registerCommandSet('sample_set', sampleSet);
	/* Shell auto-completion setup */
	completion.init();

	/* Main CLI */
	(async () => {
		// CLI Initialization
		await init();

		// Autorun main command
		runCommand(mainSet, process.argv.slice(2));
	})();
}

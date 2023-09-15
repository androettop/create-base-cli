const childProcess = require('child_process');
const completion = require('../completion');
const {
	updateGlobalConfig,
	setConfig,
	getConfig
} = require('../config/getConfig');
const logger = require('../logger');
const { packageVersion, binName } = require('../package/package');

const runTask = task => {
	logger.debug(`Running first run task: ${task}`);
	return new Promise(resolve => {
		const taskProcess = childProcess.fork(__filename, [`--${task}`]);
		taskProcess.on('close', () => {
			logger.debug(`First run task ${task} completed.`);
			resolve();
		});
	});
};

const isFirstRun = () => !(getConfig('firstRunExecuted', 'global') || false);

const isJustUpdated = () => {
	const lastVersion = getConfig('lastVersion', 'global');
	const currentVersion = packageVersion;
	if (lastVersion !== currentVersion) {
		updateGlobalConfig('lastVersion', currentVersion);
		return true;
	}
	return false;
};

const executePostInstallScript = async () => {
	if (process.argv.every(arg => !arg.startsWith('--frtask'))) {
		const scriptName = isFirstRun() ? 'first run' : 'post update';
		logger.log(`Running ${scriptName} script...`);
		// run setup
		await runTask('frtask-completion-cleanup');
		await runTask('frtask-completion-setup');
		await runTask('frtask-version-cache-cleanup');

		// set first run flag
		logger.success(`${scriptName} script completed.`);
		// si el proceso se inicio con parametros...
		if (process.argv.length > 2) {
			logger.warn(
				`The command you were trying to run was not executed during the ${scriptName} script. Please run it again:\n\n${binName} ${process.argv
					.slice(2)
					.join(' ')}`
			);
		}
	}
};

// ----- First run tasks -----

// Completion cleanup step
if (process.argv.includes('--frtask-completion-cleanup')) {
	// cleanup shell init file
	completion.cleanup();
}

// Completion setup step
if (process.argv.includes('--frtask-completion-setup')) {
	// cleanup shell init file
	completion.setup();
}

// Cleanup version cache
if (process.argv.includes('--frtask-version-cache-cleanup')) {
	setConfig('lastUpdatesCheck', new Date().toISOString(), 'global');
	setConfig('lastVersion', packageVersion, 'global');
}

module.exports = {
	isFirstRun,
	executePostInstallScript,
	isJustUpdated
};

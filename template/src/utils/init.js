const unhandled = require('cli-handle-unhandled');
const { getConfig } = require('./config/getConfig');
const logger = require('./logger');
const checkForUpdates = require('./updates/checkForUpdates');
const { binName } = require('./package/package');

module.exports = async () => {
	logger.debug(`Running ${binName} initialization script.`);
	unhandled();

	// Check for updates every 8 hours
	const TIME_FOR_UPDATE_CHECK = 1000 * 60 * 60 * 8;
	const lastUpdatesCheck = getConfig('lastUpdatesCheck', 'global');
	const lastVersion = getConfig('lastVersion', 'global');
	if (
		!lastUpdatesCheck ||
		Date.now() - new Date(lastUpdatesCheck).getTime() >=
			TIME_FOR_UPDATE_CHECK
	) {
		await checkForUpdates();
	} else if (lastVersion) {
		await checkForUpdates(lastVersion);
	}
};

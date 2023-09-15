const { exec } = require('child_process');
const { setConfig } = require('../config/getConfig');
const logger = require('../logger');
const { binName, packageName, packageVersion } = require('../package/package');

const checkForUpdates = async version => {
	let versionStr;
	if (version) {
		logger.debug(`Avoiding update check, using cached version ${version}`);
		versionStr = version;
	} else {
		logger.debug(`Checking for updates...`);
		versionStr = await new Promise((resolve, reject) => {
			exec(`npm show ${packageName} version`, (err, stdout) => {
				if (err) {
					reject(err);
				} else {
					resolve(stdout.trim());
				}
			});
		});
	}

	const lastVersion = versionStr.split('.').map(e => parseInt(e, 10));
	const currentVersion = packageVersion.split('.').map(e => parseInt(e, 10));

	let updateType = 'none';

	if (lastVersion[0] > currentVersion[0]) {
		updateType = 'major';
	} else if (
		lastVersion[0] === currentVersion[0] &&
		lastVersion[1] > currentVersion[1]
	) {
		updateType = 'minor';
	} else if (
		lastVersion[0] === currentVersion[0] &&
		lastVersion[1] === currentVersion[1] &&
		lastVersion[2] > currentVersion[2]
	) {
		updateType = 'patch';
	}

	if (updateType !== 'none') {
		logger.warn(
			`\nNew ${updateType} version of ${binName} available!. (${packageVersion} -> ${versionStr})\nRun "npm install -g ${packageName}" to update.\n`
		);
		// Sleep for 2 seconds to allow the user to read the message
		await new Promise(resolve => {
			setTimeout(resolve, 2000);
		});
	}

	// Save the last version and the check date
	setConfig('lastUpdatesCheck', new Date().toISOString(), 'global');
	setConfig('lastVersion', versionStr, 'global');
};

module.exports = checkForUpdates;

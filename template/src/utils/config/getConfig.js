const os = require('os');
const fs = require('fs');
const config = require('../../config/config.json');
const logger = require('../logger');
const defaultConfig = require('../../config/default_config.json');
const chalk = require('chalk');

const getGlobalConfigPath = () => {
	// get user config.json
	const homedir = os.homedir();
	const configdir = `${homedir}/${config.configDirName}`;

	// If configdir does not exist, create it
	if (!fs.existsSync(configdir)) {
		fs.mkdirSync(configdir);
	}

	const configPath = `${configdir}/${config.globalConfigName}`;

	// if config.json does not exist, create it
	if (!fs.existsSync(configPath)) {
		fs.writeFileSync(configPath, JSON.stringify({}, null, 4));
	}

	return configPath;
};

const recursiveMerge = (object1, object2) => {
	if (Array.isArray(object2)) {
		return [...new Set([...object1, ...object2])];
	} else {
		return Object.entries(object2).reduce(
			(acc, [key, value]) => {
				if (
					Object.keys(acc).includes(key) &&
					typeof value === 'object'
				) {
					acc[key] = recursiveMerge(acc[key], value);
				} else {
					acc[key] = value;
				}

				return acc;
			},
			{ ...object1 }
		);
	}
};

const updateGlobalConfig = () => {
	const currentConfigFile = getGlobalConfigPath();
	const currentConfigJson = JSON.parse(
		fs.readFileSync(currentConfigFile, 'utf8')
	);

	const updatedConfig = recursiveMerge(currentConfigJson, defaultConfig);

	fs.writeFileSync(currentConfigFile, JSON.stringify(updatedConfig, null, 4));
};

const getConfig = setting => {
	const configFile = getGlobalConfigPath();

	if (!configFile) {
		logger.debug(chalk`Config file {bold ${configFile}} not found`);
		return;
	}

	const configJson = fs.readFileSync(configFile, 'utf8');
	const configData = JSON.parse(configJson);
	return configData[setting];
};

const setConfig = (setting, value) => {
	const configFile = getGlobalConfigPath();

	const configJson = fs.readFileSync(configFile, 'utf8');
	const configData = JSON.parse(configJson);
	configData[setting] = value;
	fs.writeFileSync(configFile, JSON.stringify(configData, null, 4));
};

module.exports = {
	getConfig,
	setConfig,
	getGlobalConfigPath,
	updateGlobalConfig
};

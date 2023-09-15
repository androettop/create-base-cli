const logger = require('../../utils/logger');

const sample = async (namedParams, params, flags) => {
	logger.debug(namedParams, params, flags);
	logger.success('This is a sample command');
};

module.exports = sample;

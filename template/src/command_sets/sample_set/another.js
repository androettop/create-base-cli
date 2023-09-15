const logger = require('../../utils/logger');

const another = async (namedParams, params, flags) => {
	logger.success('This is another command');
};

module.exports = another;

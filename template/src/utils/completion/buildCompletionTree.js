const { getCommandSet } = require('../commands/registerCommandSet');

const buildCompletionTree = set => {
	let setData = set;

	if (set.load_dynamically_from) {
		setData = getCommandSet(set.load_dynamically_from);
	}

	if (!setData.commands) {
		if (Object.keys(setData?.params || {}).length > 0) {
			return buildParamsTree(Object.values(setData.params));
		}
		return {};
	}

	const children = {};

	for (let i = 0; i < setData.commands.length; i += 1) {
		const command = setData.commands[i];
		children[command.name] = buildCompletionTree(command);
	}

	return children;
};

const buildParamsTree = params => {
	if (params.length > 0) {
		const [firstParam, ...restOfParams] = params;
		const options = firstParam.options;
		if (!options) {
			return {};
		}
		const children = {};
		for (let i = 0; i < options.length; i += 1) {
			const option = options[i];
			children[option] = buildParamsTree(restOfParams);
		}
		return children;
	} else {
		return {};
	}
};

module.exports = buildCompletionTree;

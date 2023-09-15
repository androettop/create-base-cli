global.commandSets = global.commandSets || {};
global.clis = global.clis || {};

const registerCommandSet = (name, commandSet) => {
	// Register command set
	global.commandSets[name] = commandSet;
};

const getCommandSets = () => global?.commandSets;

const getCommandSet = name => global?.commandSets?.[name];

const loadCommandData = command => {
	if (command?.load_dynamically_from) {
		return {
			...command,
			...getCommandSet(command.load_dynamically_from),
			load_dynamically_from: false
		};
	}
	return command;
};

module.exports = {
	registerCommandSet,
	getCommandSets,
	getCommandSet,
	loadCommandData
};

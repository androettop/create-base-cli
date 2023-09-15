const meow = require('meow');
const config = require('../../config/config.json');
const buildHelp = require('../cli/buildHelp');
const formatName = require('../cli/formatName');
const logger = require('../logger');
const { isCommandSet } = require('./commandUtils');
const { loadCommandData } = require('./registerCommandSet');
const { binName } = require('../package/package');

const runCommand = (command, argv, parentName = binName) => {
	// Prepare help flags
	const flags = {
		...(command.flags || {}),
		...config.globalFlags
	};

	// We create a new meow instance with the command's help text
	const cli = meow({
		argv,
		inferType: true,
		description: false,
		hardRejection: false,
		flags: flags,
		autoHelp: false,
		autoVersion: false
	});

	// If the current command is a command set and has no subcommands,
	if (isCommandSet(command) && cli.input.length === 0) {
		console.log(
			buildHelp({
				name: parentName,
				description: command.description,
				flags: flags,
				commands: command.commands
			})
		);
		process.exit(0);
	}

	if (!isCommandSet(command) && cli.flags.help) {
		console.log(
			buildHelp({
				name: parentName,
				usage: command.usage,
				params: command.params,
				description: command.description,
				flags: flags
			})
		);
		process.exit(0);
	}

	// If the command is not a command set, run it
	if (!isCommandSet(command)) {
		//prepare params
		const params = {};
		const paramKeys = Object.keys(command.params || {});
		for (let i = 0; i < cli.input.length || i < paramKeys.length; i += 1) {
			const paramName = paramKeys[i];
			params[paramName] = cli.input[i];
		}
		return command.fn(params, cli.input, cli.flags);
	}

	// if the current command is a command set
	if (isCommandSet(command)) {
		// Get the selected sub-command
		const subCommandName = cli.input?.[0];
		// Get the sub-command data
		const subCommand = loadCommandData(
			subCommandName
				? command.commands.find(c => c.name === subCommandName)
				: undefined
		);

		// If the sub-command exists, run it
		if (subCommand) {
			return runCommand(
				subCommand,
				argv.slice(1),
				formatName([parentName, subCommand.name])
			);
		}

		// If the sub-command does not exist, show an warning message and exit
		if (subCommandName) {
			logger.warn(
				`Command "${subCommandName}" not found. See "${parentName} --help"`
			);
			process.exit(127);
		}
	}

	return true;
};

module.exports = runCommand;

/**
 * Help text cretor based on cli-meow-help
 */

const chalk = require('chalk');

const createTable = require('cli-meow-help/utils/createTable');
const getDefaultValue = require('cli-meow-help/utils/getDefaultValue');
const decamelize = require('decamelize');
const { isCommandSet } = require('../commands/commandUtils');
const { loadCommandData } = require('../commands/registerCommandSet');

const { dim } = chalk;
const greenInverse = chalk.bold.inverse.green;
const yellowInverse = chalk.bold.inverse.yellow;
const magentaInverse = chalk.bold.inverse.magenta;

const groupCommandsByType = commands => {
	const groupedCommands = {};

	for (let i = 0; i < commands.length; i += 1) {
		const command = commands[i];
		const commandData = loadCommandData(command);
		const commandType = isCommandSet(commandData)
			? 'command_set'
			: 'command';
		if (!groupedCommands[commandType]) {
			groupedCommands[commandType] = [];
		}

		groupedCommands[commandType].push(commandData);
	}

	return groupedCommands;
};

const commandTypes = {
	command: {
		title: 'COMMANDS',
		color: 'cyan'
	},
	command_set: {
		title: 'MANAGEMENT COMMANDS',
		color: 'blue'
	}
};

module.exports = ({
	name = `(CLI name undefined)`,
	params,
	description,
	commands = [],
	flags,
	defaults = false
}) => {
	let help = '';
	const spacer = `\n`;

	const hasCommands = commands?.length > 0;
	const hasParams = commands?.some(
		c => Object.keys(c.params || {}).length > 0
	);
	const hasOptions = !!flags;

	// Usage.
	help += `${greenInverse(` USAGE `)} ${spacer}`;
	help += chalk`{gray $} {green ${name}} `;

	if (hasCommands) {
		help += chalk`{cyan <command>} `;
	}

	if (params) {
		const paramsKeys = Object.keys(params);
		help += chalk`{magenta ${paramsKeys
			.map(param => `<${param}>`)
			.join(' ')}} `;
	} else if (hasParams) {
		help += chalk`{magenta <params>} `;
	}

	if (hasOptions) {
		help += chalk`{yellow [option]} `;
	}

	// Description

	if (description) {
		help += `${spacer}${description}`;
	}

	if (params) {
		help += chalk`\n\n${magentaInverse(` PARAMS `)} ${spacer}`;
		const tableParams = createTable();
		const paramKeys = Object.keys(params);
		for (let i = 0; i < paramKeys.length; i += 1) {
			const paramName = paramKeys[i];
			const param = params[paramName];

			tableParams.push([
				chalk`{magenta ${paramName}}`,
				`${param.description}`
			]);
		}

		help += tableParams.toString();
	}

	const groupedCommands = groupCommandsByType(commands);

	// for each group of commands print a help section
	const commandGroups = Object.keys(groupedCommands);
	for (let i = 0; i < commandGroups.length; i += 1) {
		const commandGroup = commandGroups[i];
		const commandsInGroup = groupedCommands[commandGroup];
		const titleColor =
			chalk.bold.inverse?.[commandTypes[commandGroup].color] ||
			chalk.bold.inverse.white;
		const commandColor =
			chalk?.[commandTypes[commandGroup].color] || chalk.white;
		help += `\n\n${titleColor(
			` ${commandTypes?.[commandGroup]?.title || 'COMMANDS'} `
		)} ${spacer}`;
		const tableCommands = createTable();
		const commandKeys = Object.keys(commandsInGroup);

		for (let j = 0; j < commandKeys.length; j += 1) {
			const command = commandKeys[j];
			const options = commandsInGroup[command];

			let commandText = commandColor(options.name);
			if (options.params) {
				// replace text between <> with the text as upperCase
				const params = Object.keys(options.params).map(
					param => chalk`{magenta <${param}>}`
				);
				commandText = [commandColor(options.name), ...params].join(' ');
			}

			tableCommands.push([chalk(commandText), `${options.description}`]);
		}
		help += tableCommands.toString();
	}

	// Flags.
	if (flags) {
		help += `\n\n${yellowInverse(` OPTIONS `)} ${spacer}`;
		const tableFlags = createTable();
		const flagKeys = Object.keys(flags);

		for (let i = 0; i < flagKeys.length; i += 1) {
			const flag = flagKeys[i];
			const options = flags[flag];
			const alias = options.alias ? `-${options.alias}, ` : ``;
			const defaultValue = getDefaultValue(defaults, options);

			tableFlags.push([
				chalk`{yellow ${alias}--${decamelize(flag, '-')}}`,
				`${options.description} ${dim(defaultValue)}`
			]);
		}

		help += tableFlags.toString();
	}
	help += `\n`;

	return help;
};

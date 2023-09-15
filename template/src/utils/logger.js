const chalk = require('chalk');
const green = chalk.green;
const greenI = chalk.green.bold.inverse;
const red = chalk.red;
const redI = chalk.red.bold.inverse;
const orange = chalk.keyword('orange');
const orangeI = chalk.keyword('orange').bold.inverse;
const blue = chalk.blue;
const blueI = chalk.blue.bold.inverse;
const magenta = chalk.magenta;
const magentaI = chalk.magenta.bold.inverse;

const alert = options => {
	const defaultOptions = {
		type: `error`,
		msg: `You forgot to define all options.`,
		name: ``
	};
	const opts = { ...defaultOptions, ...options };
	const { type, msg, name } = opts;
	const printName = name ? name : type.toUpperCase();

	const timestamp = `[${new Date().toLocaleTimeString()}] `;

	if (type === `success`) {
		console.log(`${timestamp}${greenI(` ${printName} `)} ${green(msg)}`);
	}

	if (type === `warning`) {
		console.log(`${timestamp}${orangeI(` ${printName} `)} ${orange(msg)}`);
	}

	if (type === `debug`) {
		console.log(
			`${timestamp}${magentaI(` ${printName} `)} ${magenta(msg)}`
		);
	}

	if (type === `info`) {
		console.log(`${timestamp}${blueI(` ${printName} `)} ${blue(msg)}`);
	}

	if (type === `error`) {
		console.log(`${timestamp}${redI(` ${printName} `)} ${red(msg)}`);
	}
};

const baseLog = (type, ...args) => {
	if (
		type === `debug` &&
		!(process.argv.includes(`--debug`) || process.argv.includes(`-d`))
	) {
		return;
	}

	// handle the arguments individually to compose our log message
	let message = null;
	for (let portion of args) {
		if (portion instanceof Error) {
			if (message) {
				message = `${message} ${portion.toString()}`;
			} else {
				message = `${portion.toString()} ${JSON.stringify(
					portion,
					undefined,
					4
				)}`;
			}
		} else if (typeof portion === 'string') {
			if (message) {
				message = `${message} ${portion}`;
			} else {
				message = portion;
			}
		} else {
			let stringified;
			try {
				stringified = JSON.stringify(portion, undefined, 4);
			} catch (e) {
				// failed to parse as json
				stringified = `[${typeof portion}]`;
			}

			if (message) {
				if (stringified.indexOf('\n') !== -1) {
					// append multiline objects to the end
					message = `${message}\n${stringified}`;
				} else {
					message = `${message} ${stringified}`;
				}
			} else {
				message = stringified;
			}
		}
	}

	alert({
		type: type,
		name: type.toUpperCase(),
		msg: message
	});

	return true;
};

const stdio = () => {
	if (process.argv.includes(`--debug`) || process.argv.includes(`-d`)) {
		return 'inherit';
	} else {
		return 'pipe';
	}
};

const log = (...args) => baseLog(`info`, ...args);
const debug = (...args) => baseLog(`debug`, ...args);
const warn = (...args) => baseLog(`warning`, ...args);
const error = (...args) => baseLog(`error`, ...args);
const success = (...args) => baseLog(`success`, ...args);

const logger = {
	log,
	debug,
	warn,
	error,
	success,
	stdio
};
module.exports = logger;

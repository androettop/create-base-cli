const isCommandSet = command => command?.commands?.length > 0 && !command?.fn;

module.exports = {
	isCommandSet
};

# {{packageName}}

This document is intended to help developers to understand how {{packageName}} cli works internally.

## Command Sets & Commands

The `src/command_sets` directory contains the source code of each command set, following the next structure:

`src/command_sets/<command_set_name>/index.js`

Inside the command set, you can find a js file for each command, following the next structure:

`src/command_sets/<command_set_name>/<command_name>.js`

So, for example, the code of the command `{{bin}} compose start` is located at: `src/command_sets/compose/start.js`

### Command set

A command set is a JSON object that contains the following structure:

```ts
type CommandSet = {
	description?: string;
	commands?: Array<Command>;
	flags?: Record<string, Flag>;
	load_dynamically_from?: string;
};
```

-   **description** (optional): a description of the command set, is displayed in the help text.
-   **commands** (optional): an array of commands/command sets.
-   **flags** (optional): a record of flags.
-   **load_dynamically_from** (optional): the registration name of the command set. If this is set, the command set will be loaded dynamically from the command registry.

### Command

A command is a JSON object with the following structure:

```ts
type Command = {
	name: string;
	flags?: Record<string, Flag>;
	params?: Record<string, Param>;
	description?: string;
	fn: (namedParams, params, flags) => Promise<void>;
};
```

-   **name**: the name of the command, it cannot contain spaces.
-   **description** (optional): a description of the command, is displayed in the help text.
-   **flags** (optional): a record of flags.
-   **params** (optional): a record of parameters.
-   **fn**: the function that will be executed when the command is called.

### Flags (Options)

The flags behavior is inherited from the [meow](https://www.npmjs.com/package/meow) library, and works exactly the same way. Here is an extract from the documentation:

Type: `object`

Define argument flags.

The key is the flag name in camel-case and the value is an object with any of:

-   `type`: Type of value. (Possible values: `string` `boolean` `number`)
-   `alias`: Usually used to define a short flag alias.
-   `default`: Default value when the flag is not specified.
-   `isRequired`: Determine if the flag is required. (Default: false)
    -   If it's only known at runtime whether the flag is required or not, you can pass a `Function` instead of a `boolean`, which based on the given flags and other non-flag arguments, should decide if the flag is required. Two arguments are passed to the function:
    -   The first argument is the **flags** object, which contains the flags converted to camel-case excluding aliases.
    -   The second argument is the **input** string array, which contains the non-flag arguments.
    -   The function should return a `boolean`, true if the flag is required, otherwise false.
-   `isMultiple`: Indicates a flag can be set multiple times. Values are turned into an array. (Default: false)
    -   Multiple values are provided by specifying the flag multiple times, for example, `$ foo -u rainbow -u cat`. Space- or comma-separated values are [currently _not_ supported](https://github.com/sindresorhus/meow/issues/164).

Note that flags are always defined using a camel-case key (`myKey`), but will match arguments in kebab-case (`--my-key`).

Example:

```js
flags: {
	unicorn: {
		type: 'string',
		alias: 'u',
		default: ['rainbow', 'cat'],
		isMultiple: true,
		isRequired: (flags, input) => {
			if (flags.otherFlag) {
				return true;
			}
			return false;
		}
	}
}
```

#### Global Flags

By the moment, there are two global flags, defined in the ´src/config/config.json´ file:
- help: displays the help text of the current command.
- debug: enables the debug log level.

### Command Registry

The command registry is a global object that contains all the commands sets of  {{packageName}}, every command set is registered in the registry in the `src/index.js` file.

```js
...
const mainSet = require('./command_sets/main');
const stackSet = require('./command_sets/stack');
const composeSet = require('./command_sets/compose');

/* Command sets registration */
registerCommandSet('main_set', mainSet);
registerCommandSet('stack_set', stackSet);
registerCommandSet('compose_set', composeSet);

...
```

This is useful to load commands dynamically and generate help texts or the auto-completion of the commands.

Additionally, in the future, this feature can be used to add extra functionalities to the CLI in a dynamic way with Plugins.

### How commands run?

The user input is parsed by the runCommand function (`src/utils/commands/runCommand.js`), this function receives the user input and the main command set, and recursively parses the input to find and run the command.

## Configurations

The cli can work with configurations files, which are JSON files that contain some useful information for the cli, these are the configurations that are loaded from the user home directory (~/.{{bin}}/config.json).

This configuration can be accessed using the `src/utils/config` utilities.

The script path is always relative to the current enviroment.

## Auto-completion

The command line auto-completion is implemented using the [omelette](https://www.npmjs.com/package/omelette) library.

The auto-completion setup occurs in the first run script of {{packageName}}.

We are currently using the Tree API to generate the auto-completion.

The auto-completion tree is created reading the command sets and commands from the registry in the `src/utils/completion/buildCompletionTree.js` file.


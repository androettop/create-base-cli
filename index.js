#!/usr/bin/env node
const fse = require("fs-extra");
const shell = require("shelljs");

const writeTemplateFile = (fileName, dest, parameters) => {
  const content = fse.readFileSync(fileName, "utf8").toString();

  const processedTemplate = Object.entries(parameters).reduce(
    (acc, [key, value]) => {
      return acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), value);
    },
    content
  );

  fse.writeFileSync(dest, processedTemplate);
};

const writeTemplate = (parameters) => {
  fse.copySync(__dirname + "/template", parameters.projectDirectory, {
    filter: (src, dest) => {
      if (fse.lstatSync(src).isDirectory()) {
        return true;
      }

      writeTemplateFile(src, dest, parameters);
      return false;
    },
  });

  // Rename _gitignore to .gitignore (needed for npm publish)
  fse.renameSync(
    `${parameters.projectDirectory}/_gitignore`,
    `${parameters.projectDirectory}/.gitignore`
  );
};

const run = async () => {
  // Check dependencies
  if (!shell.which("git")) {
    shell.echo("Sorry, this script requires git");
    shell.exit(1);
  }

  const projectDirectory = process.argv[2];

  if (!projectDirectory) {
    console.log("Please specify a project name:");
    console.log("create-base-cli my-project");
    process.exit(1);
  }

  // remove all invalid chars
  const packageName = projectDirectory.replace(/[^a-z0-9-]/gi, "-");

  const parameters = {
    projectDirectory,
    packageName: projectDirectory,
    packageDescription: "Base CLI",
    bin: projectDirectory,
  };

  writeTemplate(parameters);

  // move to project directory
  shell.cd(projectDirectory);

  // init git repo
  shell.exec("git init");

  // install dependencies
  shell.exec("npm install");

  console.log("Done! 🎉");
  console.log("");
  console.log("Next steps:");
  console.log(`cd ${projectDirectory}`);
  console.log("npm link");
  console.log(`${projectDirectory} --help`);
};

run();

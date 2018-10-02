const shell = require("shelljs");
const path = require("path");
const yargs = require("yargs");
const child_process = require("child_process");

const projectRoot = path.join(__dirname, "..");
const modulePath = path.join(projectRoot, "node_modules/.bin");

shell.config.silent = true;

const DONE = `\u{1b}[0;32mdone.\u{1b}[0m`;
const FAILED = `\u{1b}[0;31mFAILED\u{1b}[0m`;

function build() {
  shell.echo(`*** START BUILDING ***`);

  shell.echo("-n", "remove previous results...");
  shell.rm("-rf", path.join(projectRoot, "dist/"));
  shell.echo(DONE);

  shell.echo("-n", "transpile typescript...");
  const result = shell.exec(`${modulePath}/tsc -p .`);
  if (result.code) {
    shell.echo(FAILED);
    shell.echo(result.stderr);
    shell.exit(result.code);
  }
  shell.echo(DONE);

  shell.echo("*** BUILD SUCCESS ***");
}

function lint() {
  shell.echo("*** START LINTING ***");
  shell.echo("-n", "linting code...");

  const result = shell.exec(`${modulePath}/tslint -p .`);
  shell.echo(result.code ? FAILED : DONE);
  shell.echo();
  shell.echo(result.stdout);
  shell.echo(result.stderr);
  if (result.code) {
    shell.exit(result.code);
  }

  shell.echo("*** LINT PASSED ***");
}

function test(args) {
  shell.echo("*** START TESTING ***");

  shell.echo("-n", "remove previous results...");
  shell.rm("-rf", path.join(projectRoot, "coverage/"));
  shell.echo(DONE);

  if (args.release) {
    shell.echo("-n", "launch tests for release...");
    const result = shell.exec(`${modulePath}/jest --colors --ci --detectOpenHandles`);
    shell.echo(result.code ? FAILED : DONE);
    shell.echo();
    shell.echo(result.stdout);
    shell.echo(result.stderr);
    if (result.code) { shell.exit(result.code); }
    shell.echo("*** TEST PASSED ***");
  } else {
    shell.echo("launch tests...");

    shell.echo("Please run ``jest --colors --watchAll`` instead of ``node tasks.js test``");
    shell.echo("Because shelljs cannot inherit stdin, so we can't support multi OS platform in this shell.");
    shell.echo("See Also: https://github.com/shelljs/shelljs/wiki/FAQ");

    // shell.exec(`${modulePath}/jest --colors --watchAll`, { silent: false })
  }
}

yargs
  .command("build", "Build the app.", {}, (args) => build())
  .command("lint", "Linting the code.", {}, (args) => lint())
  .command("test", "Start unit testing.", {
    release: {
      alias: "r",
      boolean: true,
    },
  }, (args) => {
    if (args.release) {
      build();
      shell.echo();
      lint();
      shell.echo();
    }
    test(args);
  })
  .demandCommand(1)
  .help("h")
  .alias("h", "help")
  .argv;

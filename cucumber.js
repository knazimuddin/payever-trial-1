const common = [
  // `--format ${process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'}`,
  "--format progress",
  "--parallel 1",
  "--require-module ts-node/register",
  "--require ./features/bootstrap/**/*.ts",
  "--require ./features/step_definitions/**/*.ts",
  "--logLevel=error",
].join(" ");

module.exports = {
  default: common,
};

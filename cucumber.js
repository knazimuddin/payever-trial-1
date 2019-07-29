var common = [
  // `--format ${process.env.CI || !process.stdout.isTTY ? 'progress' : 'progress-bar'}`,
  "--format progress",
  "--parallel 20",
  "--require-module ts-node/register",
  "--require ./features/bootstrap/**/*.ts",
  "--require ./features/step_definitions/**/*.ts",
  "--logLevel=error",
  "--format json:reports/cucumber-report.json",
].join(" ");

module.exports = {
  default: common,
};

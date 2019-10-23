const common = [
  "--format progress",
  "--parallel 1",
  "--require-module ts-node/register/transpile-only",
  "--require ./features/bootstrap/**/*.ts",
].join(" ");

module.exports = {
  default: common,
};

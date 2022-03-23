module.exports = {
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.ts?(x)"],
  testPathIgnorePatterns: ["node_modules/"],
  transformIgnorePatterns: ["^.+\\.js$"],
};

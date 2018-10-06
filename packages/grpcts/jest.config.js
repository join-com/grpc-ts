module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/generated/", "/proto/"],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  }
};

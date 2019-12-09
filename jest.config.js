// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json'],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '(^[a-zA-Z]+\\.mock\\.json)$': '<rootDir>/__mocks__/schemas/$1'
  }
};

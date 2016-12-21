// ES6 support for this example, you won't need this
require('babel-register');

const strictErrors = require('../src');
const StrictError = strictErrors.StrictError;

// Require your file that contains the definitions
const ERRORS = require('./errors');

// Convert error definitions to object that can be parsed as JSON.
console.log(JSON.stringify(strictErrors.errorsToJson(ERRORS), null, 4));

for (let i = 0; i < 3; i++) {
    if (i === 2) {
        // If you omit the required error information
        // another error will be thrown, indicating what error information is missing
        throw new StrictError(ERRORS.Example, {
            index: i
        });
    }
}


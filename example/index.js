'use strict';

// ES6 support for this example, you won't need this
require('babel-register');

const StrictError = require('../src/').StrictError;

// Require your file that contains the definitions
const ERRORS = require('./errors');

for (let i = 0; i < 3; i++) {
    if (i === 2) {
        // If you omit the required error information
        // another error will be thrown, indicating what error information is missing
        throw new StrictError(ERRORS.Example, {
            index: i
        });
    }
}

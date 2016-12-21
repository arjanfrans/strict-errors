const strictErrors = require('../src/');

const errors = {
    Example: {
        // Optional error name, if it is the same as the key there is no need to provide it
        name: 'ExampleError',

        // Error message, can be a string or a function that returns a string
        message: data => `Error at index "${data.index}".`,

        // Document additional data fields that can provide error information
        data: {
            index: 'Index of array where error occurred',
            nested: {
                example: 'yes'
            }
        },

        // Required error information
        required: ['index']
    }
};

module.exports = strictErrors.createErrorDefinitions(errors);

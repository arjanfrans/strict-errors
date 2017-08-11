import { createErrorDefinitions } from '../src'

const errors = {
    Example: {
        // Optional error name, if it is the same as the key there is no need to provide it
        name: 'ExampleError',

        // Error message, can be a string or a function that returns a string
        message: data => `Error at index "${data.index}". Nested prop: ${data.nested.example}`,

        // Document additional data fields that can provide error information
        properties: {
            index: {
                description: 'Index of array where error occurred',
                type: 'integer'
            },
            nested: {
                type: 'object',
                properties: {
                    example: {
                        description: 'Nested property example',
                        type: 'string'
                    }
                }
            }
        },

        // Required error information
        required: [ 'index', 'nested' ]
    }
}

export default createErrorDefinitions(errors)

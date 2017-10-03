import { createErrorDefinitions } from '../src'

const errors = {
    Example: {
        // Optional error name, if it is the same as the key there is no need to provide it
        name: 'ExampleError',

        // Error message, can be a string or a function that returns a string
        message: data => `Error at index "${data.index}". Nested prop: ${data.nested.example}. ${data.enumTest}`,

        // Document additional data fields that can provide error information
        properties: {
            index: {
                description: 'Index of array where error occurred',
                type: 'integer',
                maximum: 10
            },
            enumTest: {
                type: 'string',
                enum: [ 'test' ]
            },
            nested: {
                type: 'object',
                properties: {
                    example: {
                        description: 'Nested property example',
                        type: 'string',
                        minLength: 20,
                        maxLength: 25
                    }
                }
            }
        },

        // Required error information
        required: [ 'index', 'nested' ]
    }
}

export default createErrorDefinitions(errors)

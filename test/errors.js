const assert = require('assert')
const strictErrors = require('../src')
const createErrorDefinitions = strictErrors.createErrorDefinitions
const StrictError = strictErrors.StrictError
const errorsToJson = strictErrors.errorsToJson

const DEFINITIONS = {
    ValidationError: {
        message: data => `Validation failed for property "${data.field}".`,
        properties: {
            field: {
                description: 'Field where validation failed.',
                type: 'string'
            },
            value: {
                description: 'value that was given.',
                type: 'string'
            }
        },
        required: [ 'field' ]
    },
    NestedError: {
        message: 'error with nested example.',
        properties: {
            obj: {
                type: 'object',
                properties: {
                    value: {
                        description: 'value of a nested object',
                        type: 'string'
                    }
                },
                required: [ 'value' ]
            }
        },
        required: [ 'obj' ]
    },
    NestedWithFunction: {
        message: data => `Value: ${data.nested.value}`,
        properties: {
            nested: {
                type: 'object',
                properties: {
                    value: {
                        type: 'string',
                        minLength: 5
                    }
                }
            }
        }
    }
}

describe('createErrorDefinitions', function () {
    context('with validation', function () {
        const definitions = createErrorDefinitions(DEFINITIONS)
        const ValidationError = definitions.ValidationError
        const NestedError = definitions.NestedError

        it('definitions created', function () {
            assert.strictEqual(ValidationError.name, 'ValidationError')
            assert.strictEqual(typeof ValidationError.message, 'function')
            assert.strictEqual(typeof ValidationError.validate, 'function')

            assert.deepStrictEqual(ValidationError.data, DEFINITIONS.ValidationError.data)
            assert.deepStrictEqual(ValidationError.required, DEFINITIONS.ValidationError.required)

            assert.strictEqual(NestedError.name, 'NestedError')
            assert.strictEqual(typeof NestedError.message, 'string')
            assert.strictEqual(typeof NestedError.validate, 'function')

            assert.deepStrictEqual(NestedError.data, DEFINITIONS.NestedError.data)
            assert.deepStrictEqual(NestedError.required, DEFINITIONS.NestedError.required)
        })

        it('error can not be created if `data` are invalid', () => {
            try {
                throw new StrictError(ValidationError)
            } catch (err) {
                let expectedMessage = 'ValidationError \'data\' are invalid:'

                expectedMessage += '\n  - data should have required property \'field\''

                assert.strictEqual(err.message, expectedMessage)
            }

            try {
                throw new StrictError(NestedError, { obj: {} })
            } catch (err) {
                let expectedMessage = 'NestedError \'data\' are invalid:'

                expectedMessage += '\n  - data.obj should have required property \'value\''

                assert.strictEqual(err.message, expectedMessage)
            }
        })

        it('ValidationError is created', function () {
            const error = new StrictError(ValidationError, { field: 'text' })

            assert.strictEqual(error.name, 'ValidationError')
            assert.strictEqual(error.message, 'Validation failed for property "text".')
            assert.deepStrictEqual(error.data, { field: 'text' })
            assert.strictEqual(typeof error.toJSON, 'function')
            assert.deepStrictEqual(error.toJSON(), {
                name: 'ValidationError',
                message: 'Validation failed for property "text".',
                data: { field: 'text' }
            })

            assert(error.stack)
        })

        it('NestedError is created, properties are immutable', function () {
            const error = new StrictError(NestedError, { obj: { value: 'test' } })

            assert.throws(() => {
                error.message = 'something'
            }, /Cannot assign to read only/)

            assert.throws(() => {
                error.data.something = 'something'
            }, /Cannot add property /)
        })
    })

    context('without validation', function () {
        const definitions = createErrorDefinitions(DEFINITIONS, { validate: false })
        const ValidationError = definitions.ValidationError

        it('no error is thrown when missing required data', function () {
            assert.doesNotThrow(() => {
                new StrictError(ValidationError)
            })
        })
    })

    it('errors to json', () => {
        const definitions = createErrorDefinitions(DEFINITIONS, { validate: false })
        const json = errorsToJson(definitions)

        assert.deepStrictEqual(json, [
            {
                name: 'ValidationError',
                message: 'Validation failed for property "hello world".',
                properties: {
                    field: {
                        description: 'Field where validation failed.',
                        type: 'string'
                    },
                    value: {
                        description: 'value that was given.',
                        type: 'string'
                    }
                },
                required: [ 'field' ],
                type: 'object'
            },
            {
                name: 'NestedError',
                message: 'error with nested example.',
                properties: {
                    obj: {
                        type: 'object',
                        properties: {
                            value: {
                                description: 'value of a nested object',
                                type: 'string'
                            }
                        },
                        required: [ 'value' ]
                    }
                },
                required: [ 'obj' ],
                type: 'object'
            },
            {
                name: 'NestedWithFunction',
                message: 'Value: hello world',
                properties: {
                    nested: {
                        properties: {
                            value: {
                                type: 'string',
                                minLength: 5
                            }
                        },
                        type: 'object'
                    }
                },
                type: 'object'
            }
        ])
    })
})

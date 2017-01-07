const assert = require('assert');
const strictErrors = require('../src');
const createErrorDefinitions = strictErrors.createErrorDefinitions;
const StrictError = strictErrors.StrictError;
const errorsToJson = strictErrors.errorsToJson;

const DEFINITIONS = {
    ValidationError: {
        name: 'ValidationErrorName',
        message: data => `Validation failed for property "${data.field}".`,
        data: {
            field: 'Field where validation failed.',
            value: 'Value that was given.'
        },
        required: ['field']
    },
    NestedError: {
        message: 'Error with nested example.',
        data: {
            obj: {
                value: 'Value of a nested object'
            }
        },
        required: ['obj.value']
    },
    NestedWithFunction: {
        message: data => `${data.nested.value}`,
        data: {
            nested: {
                value: 'world'
            }
        }
    }
};

describe('createErrorDefinitions', function () {
    context('with validation', function () {
        const definitions = createErrorDefinitions(DEFINITIONS);
        const ValidationError = definitions.ValidationError;
        const NestedError = definitions.NestedError;

        it('definitions created', function () {
            assert.strictEqual(ValidationError.name, 'ValidationErrorName');
            assert.strictEqual(typeof ValidationError.message, 'function');
            assert.strictEqual(typeof ValidationError.validate, 'function');

            assert.deepStrictEqual(ValidationError.data, DEFINITIONS.ValidationError.data);
            assert.deepStrictEqual(ValidationError.required, DEFINITIONS.ValidationError.required);

            assert.strictEqual(NestedError.name, 'NestedError');
            assert.strictEqual(typeof NestedError.message, 'string');
            assert.strictEqual(typeof NestedError.validate, 'function');

            assert.deepStrictEqual(NestedError.data, DEFINITIONS.NestedError.data);
            assert.deepStrictEqual(NestedError.required, DEFINITIONS.NestedError.required);
        });

        it('error can not be created if it is missing a requried property', () => {
            assert.throws(() => {
                new StrictError(ValidationError);
            }, /ValidationErrorName/, 'Error "ValidationErrorName" is missing required data property "field".');

            assert.throws(() => {
                new StrictError(NestedError);
            }, /NestedError/, 'Error "NestedError" is missing required data property "obj.value".');
        });

        it('ValidationError is created', function () {
            const error = new StrictError(ValidationError, { field: 'text' });

            assert.strictEqual(error.name, 'ValidationErrorName');
            assert.strictEqual(error.message, 'Validation failed for property "text".');
            assert.deepStrictEqual(error.data, { field: 'text' });
            assert.strictEqual(typeof error.toJSON, 'function');
            assert.deepStrictEqual(error.toJSON(), {
                name: 'ValidationErrorName',
                message: 'Validation failed for property "text".',
                data: { field: 'text' }
            });

            assert(error.stack);
        });

        it('NestedError is created, properties are immutable', function () {
            const error = new StrictError(NestedError, { obj: { value: 'test' } });

            assert.throws(() => {
                error.message = 'something';
            }, /Cannot assign to read only/);

            assert.throws(() => {
                error.data.something = 'something';
            }, /Can't add property /);
        });
    });

    context('without validation', function () {
        const definitions = createErrorDefinitions(DEFINITIONS, { validate: false });
        const ValidationError = definitions.ValidationError;

        it('no error is thrown when missing required data', function () {
            assert.doesNotThrow(() => {
                new StrictError(ValidationError);
            });
        });
    });

    it('errors to json', () => {
        const definitions = createErrorDefinitions(DEFINITIONS, { validate: false });

        const json = errorsToJson(definitions);

        assert.deepStrictEqual(json, [
            {
                name: 'ValidationErrorName',
                data: {
                    field: 'Field where validation failed.',
                    value: 'Value that was given.'
                },
                required: ['field']
            },
            {
                message: 'Error with nested example.',
                data: {
                    obj: {
                        value: 'Value of a nested object'
                    }
                },
                required: ['obj.value'],
                name: 'NestedError'
            },
            {
                name: 'NestedWithFunction',
                data: {
                    nested: {
                        value: 'world'
                    }
                }
            }
        ]);
    });
});

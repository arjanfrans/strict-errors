'use strict';

const chai = require('chai');
const expect = chai.expect;

const createDefinitions = require('../lib/').createDefinitions;
const createError = require('../lib/').createError;

const simpleDefinitions = {
    ValidationError: {
        name: 'ValidationError',
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
    }
};

const jsonSchema = {
    ExampleError: {
        message: 'Failed example.',
        data: {
            field: {
                type: 'string',
            },
            value: {
                type: 'number'
            }
        },
        required: ['field']
    }
};


describe('createDefinitions', function () {
    context('simple definitions', function () {
        const noJsonDefinitions = createDefinitions(simpleDefinitions);
        const ValidationError = noJsonDefinitions.ValidationError;
        const NestedError = noJsonDefinitions.NestedError;

        it('definitions created without json schema', function () {
            expect(noJsonDefinitions).to.have.property('ValidationError');
            expect(ValidationError.name).to.equal('ValidationError');
            expect(ValidationError.message).to.be.a('function');
            expect(ValidationError.data).to.deep.equal(simpleDefinitions.ValidationError.data);
            expect(ValidationError.validate).to.be.a('function');
            expect(ValidationError.required).to.deep.equal(simpleDefinitions.ValidationError.required);

            expect(noJsonDefinitions).to.have.property('NestedError');
            expect(NestedError.name).to.equal('NestedError');
            expect(NestedError.message).to.equal(simpleDefinitions.NestedError.message);
            expect(NestedError.data).to.deep.equal(simpleDefinitions.NestedError.data);
            expect(NestedError.validate).to.be.a('function');
            expect(NestedError.required).to.deep.equal(simpleDefinitions.NestedError.required);
        });

        it('error can not be created if it is missing a requried property', function () {
            try {
                createError(ValidationError);
            } catch (err) {
                expect(err.message).to.equal('Error "ValidationError" is missing required data property "field".');
            }

            try {
                createError(NestedError);
            } catch (err) {
                expect(err.message).to.equal('Error "NestedError" is missing required data property "obj.value".');
            }
        });

        it('ValidationError is created', function () {
            const error = createError(ValidationError, { field: 'text' });

            expect(error.name).to.equal('ValidationError');
            expect(error.message).to.equal('Validation failed for property "text".');
            expect(error.data).to.deep.equal({ field: 'text' });
            expect(error.toJSON).to.be.a('function');
            expect(error.toJSON()).to.deep.equal({
                name: 'ValidationError',
                message: 'Validation failed for property "text".',
                data: { field: 'text' }
            });
            expect(error).to.have.property('stack');
        });

        it('NestedError is created', function () {
            const error = createError(NestedError, { obj: { value: 'test' } });

            expect(error.name).to.equal('NestedError');
            expect(error.message).to.equal('Error with nested example.');
            expect(error.data).to.deep.equal({ obj: { value: 'test' } });
            expect(error.toJSON).to.be.a('function');
            expect(error.toJSON()).to.deep.equal({
                name: 'NestedError',
                message: 'Error with nested example.',
                data: { obj: { value: 'test' } }
            });
            expect(error).to.have.property('stack');
        });
    });

    context('schema definitions', function () {
        const jsonDefinitions = createDefinitions(jsonSchema, { schema: 'text' });
        const ExampleError = jsonDefinitions.ExampleError;

        it('definitions created with json schema', function () {
            expect(jsonDefinitions).to.have.property('ExampleError');
            expect(ExampleError.name).to.equal('ExampleError');
            expect(ExampleError.message).to.equal('Failed example.');
            expect(ExampleError.data).to.deep.equal(jsonSchema.ExampleError.data);
            expect(ExampleError.validate).to.be.a('function');
            expect(ExampleError.required).to.deep.equal(jsonSchema.ExampleError.required);
        });

        it('error can not be created if a property is incorrect', function () {
            try {
                createError(ExampleError);
            } catch (err) {
                expect(err.message).to.equal('data should have required property \'.field\'');
            }
        });

        it('json schema based error is created', function () {
            const error = createError(ExampleError, { field: 'text' });

            expect(error.name).to.equal('ExampleError');
            expect(error.message).to.equal('Failed example.');
            expect(error.data).to.deep.equal({ field: 'text' });
            expect(error.toJSON).to.be.a('function');
            expect(error.toJSON()).to.deep.equal({
                name: 'ExampleError',
                message: 'Failed example.',
                data: { field: 'text' }
            });
            expect(error).to.have.property('stack');
        });
    });
});

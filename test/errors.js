'use strict';

const chai = require('chai');
const expect = chai.expect;

const createErrorDefinitions = require('../src/').createErrorDefinitions;
const StrictError = require('../src/').StrictError;

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

describe('createErrorDefinitions', function () {
    context('with validation', function () {
        const noJsonDefinitions = createErrorDefinitions(simpleDefinitions);
        const ValidationError = noJsonDefinitions.ValidationError;
        const NestedError = noJsonDefinitions.NestedError;

        it('definitions created', function () {
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
            let error1 = null;

            try {
                new StrictError(ValidationError);
            } catch (err) {
                error1 = err;
            }

            expect(error1).to.have.property('message', 'Error "ValidationError" is missing required data property "field".');

            let error2 = null;

            try {
                new StrictError(NestedError);
            } catch (err) {
                error2 = err;
            }

            expect(error2).to.have.property('message', 'Error "NestedError" is missing required data property "obj.value".');
        });

        it('ValidationError is created', function () {
            const error = new StrictError(ValidationError, { field: 'text' });

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

        it('NestedError is created, properties are immutable', function () {
            const error = new StrictError(NestedError, { obj: { value: 'test' } });

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

            let immutableError = null;

            try {
                error.message = 'something';
            } catch (err) {
                immutableError = err;
            }

            expect(immutableError.message).to.match(/Cannot assign to read only/);


            let immutableError2 = null;

            try {
                error.data.something = 'something';
            } catch (err) {
                immutableError2 = err;
            }

            expect(immutableError2.message).to.match(/Can\'t add property /);
        });
    });

    context('without validation', function () {
        const noJsonDefinitions = createErrorDefinitions(simpleDefinitions, { validate: false });
        const ValidationError = noJsonDefinitions.ValidationError;

        it('no error is thrown when missing required data', function () {
            let error1 = null;

            try {
                new StrictError(ValidationError);
            } catch (err) {
                error1 = err;
            }

            expect(error1).to.not.exist;
        });
    });
});

'use strict';

const Ajv = require('ajv');
const ajv = Ajv({ allErrors: true });

function ajvError (errors) {
    const err = new Error('Error validation failed.');

    err.message = ajv.errorsText(errors, {
        separator: '\n  - ',
        dataVar: 'data'
    });

    return err;
}

function createSchemaValidators (definitions) {
    const validators = {};

    for (const errorName of Object.keys(definitions)) {
        const definition = definitions[errorName];

        const schema = {
            type: 'object',
            properties: definition.data || {},
        };

        if (definition.required) {
            schema.required = definition.required;
        }

        const validate = ajv.compile(schema);

        validators[errorName] = function (data) {
            const isValid = validate(data || {});

            if (isValid) {
                return true;
            }

            throw ajvError(validate.errors);
        };
    }

    return validators;
}

function createSimpleValidators (definitions) {
    const validators = {};

    for (const errorName of Object.keys(definitions)) {
        const definition = definitions[errorName];

        validators[errorName] = function (data) {
            if (definition.required) {
                for (const key of definition.required) {
                    const value = key.split('.').reduce((obj, index) => {
                        if (obj) {
                            return obj[index];
                        }

                        return null;
                    }, data);

                    if (value === null || typeof value === 'undefined') {
                        throw new Error(`Error "${errorName}" is missing required data property "${key}".`);
                    }
                }
            }

            return true;
        };
    }

    return validators;
}

function createDefinitions (definitions, options) {
    options = options || {};

    const errorDefinitions = {};
    let validators = null;

    if (options.schema) {
        validators = createSchemaValidators(definitions);
    } else {
        validators = createSimpleValidators(definitions);
    }

    const validateTrue = () => true;

    for (const errorName of Object.keys(definitions)) {
        const definition = definitions[errorName];

        errorDefinitions[errorName] = Object.assign({
            name: errorName
        }, definition);

        if (validators && validators[errorName]) {
            errorDefinitions[errorName].validate = validators[errorName];
        } else {
            errorDefinitions[errorName].validate = validateTrue;
        }
    }

    return errorDefinitions;
}

export default createDefinitions;

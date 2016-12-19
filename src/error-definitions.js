function getProperty (initial, key) {
    return key.split('.').reduce((obj, index) => {
        if (obj) {
            return obj[index];
        }

        return null;
    }, initial);
}

function createValidators (definitions) {
    const validators = {};

    for (const errorName of Object.keys(definitions)) {
        const definition = definitions[errorName];

        validators[errorName] = (data) => {
            if (definition.required) {
                for (const key of definition.required) {
                    const value = getProperty(data, key);

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

function createDefinitions (definitions, options = {}) {
    const validate = typeof options.validate !== 'undefined' ? options.validate : true;
    const errorDefinitions = {};
    const validators = createValidators(definitions);

    for (const errorName of Object.keys(definitions)) {
        const definition = definitions[errorName];

        errorDefinitions[errorName] = {
            ...definition,
            name: errorName
        };

        if (validate && validators[errorName]) {
            errorDefinitions[errorName].validate = validators[errorName];
        }
    }

    return errorDefinitions;
}

export default createDefinitions;

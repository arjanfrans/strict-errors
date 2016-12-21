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

    for (const errorKey of Object.keys(definitions)) {
        const definition = definitions[errorKey];
        const errorName = definition.name || errorKey;

        validators[errorKey] = (data) => {
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

    for (const errorKey of Object.keys(definitions)) {
        const definition = definitions[errorKey];

        errorDefinitions[errorKey] = {
            ...definition,
            name: definition.name || errorKey
        };

        if (validate && validators[errorKey]) {
            errorDefinitions[errorKey].validate = validators[errorKey];
        }
    }

    return errorDefinitions;
}

export default createDefinitions;

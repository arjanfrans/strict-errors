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

function createDefinitions (definitions) {
    const errorDefinitions = {};
    const validators = createSimpleValidators(definitions);

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

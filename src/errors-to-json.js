function updateObjectValues (obj, result = {}, parentKey = '') {
    for (const key of Object.keys(obj)) {
        const parentPath = `${parentKey === '' ? '' : '.'}${key}`;

        if (obj[key] && typeof obj[key] === 'object') {
            result[key] = {};
            updateObjectValues(obj[key], result[key], parentPath);
        } else if (parentKey !== '') {
            result[key] = `{${parentKey}.${key}}`;
        } else {
            result[key] = `{${key}}`;
        }
    }

    return result;
}

function errorsToJson (errorDefinitions) {
    return Object.keys(errorDefinitions).map((name) => {
        const definition = errorDefinitions[name];

        if (definition.name) {
            name = definition.name;
        }

        let message = definition.message;

        if (typeof message === 'function') {
            let data = {};

            if (definition.data) {
                data = updateObjectValues(definition.data);
            }

            message = message(data);
        }

        const result = Object.assign({}, definition, {
            message,
        });

        delete result.validate;

        return result;
    });
}

export default errorsToJson;

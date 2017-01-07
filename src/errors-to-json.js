function errorsToJson (errorDefinitions) {
    return Object.keys(errorDefinitions).map((name) => {
        const definition = errorDefinitions[name];

        if (definition.name) {
            name = definition.name;
        }

        const result = Object.assign({}, definition);

        if (typeof definition.message === 'function') {
            delete result.message;
        }

        delete result.validate;

        return result;
    });
}

export default errorsToJson;

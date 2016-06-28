'use strict';

function createError(definition, data) {
    if (typeof definition.validate === 'function') {
        definition.validate(data);
    }

    var message = null;

    if (typeof definition.message === 'function') {
        message = definition.message(data);
    } else {
        message = definition.message;
    }

    var err = new Error(message);

    err.name = definition.name;
    err.data = data;
    err.toJSON = function () {
        return {
            name: err.name,
            message: err.message,
            data: err.data
        };
    };

    return err;
}

module.exports = createError;
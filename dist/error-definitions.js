'use strict';

var Ajv = require('ajv');
var ajv = Ajv({ allErrors: true });

function ajvError(errors) {
    var err = new Error('Error validation failed.');

    err.message = ajv.errorsText(errors, {
        separator: '\n  - ',
        dataVar: 'data'
    });

    return err;
}

function createSchemaValidators(definitions) {
    var validators = {};

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        var _loop = function _loop() {
            var errorName = _step.value;

            var definition = definitions[errorName];

            var schema = {
                type: 'object',
                properties: definition.data || {}
            };

            if (definition.required) {
                schema.required = definition.required;
            }

            var validate = ajv.compile(schema);

            validators[errorName] = function (data) {
                var isValid = validate(data || {});

                if (isValid) {
                    return true;
                }

                throw ajvError(validate.errors);
            };
        };

        for (var _iterator = Object.keys(definitions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop();
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return validators;
}

function createSimpleValidators(definitions) {
    var validators = {};

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        var _loop2 = function _loop2() {
            var errorName = _step2.value;

            var definition = definitions[errorName];

            validators[errorName] = function (data) {
                if (definition.required) {
                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = definition.required[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var key = _step3.value;

                            var value = key.split('.').reduce(function (obj, index) {
                                if (obj) {
                                    return obj[index];
                                }

                                return null;
                            }, data);

                            if (value === null) {
                                throw new Error('Error "' + errorName + '" is missing required data property "' + key + '".');
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = true;
                        _iteratorError3 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                _iterator3.return();
                            }
                        } finally {
                            if (_didIteratorError3) {
                                throw _iteratorError3;
                            }
                        }
                    }
                }

                return true;
            };
        };

        for (var _iterator2 = Object.keys(definitions)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _loop2();
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return validators;
}

function createDefinitions(definitions, options) {
    options = options || {};

    var errorDefinitions = {};
    var validators = null;

    if (options.schema) {
        validators = createSchemaValidators(definitions);
    } else {
        validators = createSimpleValidators(definitions);
    }

    var validateTrue = function validateTrue() {
        return true;
    };

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = Object.keys(definitions)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _errorName = _step4.value;

            var _definition = definitions[_errorName];

            errorDefinitions[_errorName] = Object.assign({
                name: _errorName
            }, _definition);

            if (validators && validators[_errorName]) {
                errorDefinitions[_errorName].validate = validators[_errorName];
            } else {
                errorDefinitions[_errorName].validate = validateTrue;
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return errorDefinitions;
}

module.exports = createDefinitions;
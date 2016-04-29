'use strict';

const Ajv = require('ajv');
const ajv = Ajv();

const s = {
    type: 'object',
    properties: {
        field: {
            type: 'string',
        }
    },
    required: ['field']
};

const t = {
    type: 'object',
    properties: {
        value: {
            type: 'object',
            properties: {
                nested: {
                    type: 'string'
                }
            }
        }
    },
    required: ['value']
};

const v1 = ajv.compile(s);
const val1 = v1({
    hi: 22
});

console.log(v1.errors, val1);

const v2 = ajv.compile(t);
const val2 = v2({
    value: { nested: 22 }
});


console.log(v2.errors, val2)

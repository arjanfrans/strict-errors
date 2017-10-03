const _ = require('lodash')
const RandExp = require('randexp')

function namespace (root, ns) {
    _.each(ns.split('.'), function (part) {
        if (_.isUndefined(root[part])) {
            root[part] = {}
        }
        root = root[part]
    })

    return root
}

export default function generate (schema, path = [], depth = 0) {
    if (!_.isObject(schema)) {
        return schema
    }

    if (_.isArray(schema.enum)) {
        return generateEnum(schema, depth)
    }

    const pathString = '${' + path.join('.') + '}';

    switch (schema.type) {
        case 'array':
            return generateArray(schema, path, depth)
        case 'boolean':
            return generateBoolean(schema)
        case 'integer':
            // return pathString
            return generateInteger(schema)
        case 'number':
            // return pathString
            return generateNumber(schema)
        case 'null':
            return null
        case 'string':
            // return pathString
            return generateString(schema)
        case 'object':
        default:
            return generateObject(schema, path, depth)
    }
}

function generateArray (schema, path = [], depth = 0) {
    let range
    let min = schema.minItems
    let max = schema.maxItems

    min = (min != null ? min : 1)
    max = (max != null ? max : (min + 5))

    if (_.isArray(schema.items)) {
        const items = _.map(schema.items, function (item) {
            return generate(item, path, depth + 1)
        })

        if (schema.additionalItems) {
            range = _.range(generateNumber({
                minimum: Math.max(1, min - items.length),
                maximum: Math.max(1, max - items.length)
            }))

            items.push(..._.map(range, function () {
                return generate(schema.additionalItems, path, depth + 1)
            }))
        }

        return items
    }

    if (_.isObject(schema.items)) {
        range = _.range(generateNumber({
            minimum: min,
            maximum: max
        }))

        return _.map(range, function () {
            return generate(schema.items, path, depth + 1)
        })
    }

    return []
}

function generateBoolean () {
    return true;
}


function generateEnum (schema, depth) {
    depth = depth || 0

    const value = schema.enum[0]

    return generate(value, depth + 1)
}

function generateInteger (schema) {
    return generateNumber(schema)
}

function generateNumber (schema) {
    let min = schema.minimum
    let max = schema.maximum
    const xmin = schema.exclusiveMinimum
    const xmax = schema.exclusiveMaximum

    min = (min != null ? min : 1) + (xmin ? 1 : 0)
    max = (max != null ? max : (min + 1e10)) - (xmax ? 1 : 0)

    return min + (max - min)
}

function generateObject (schema, path = [], depth = 0) {
    let args = []
    let obj = {}

    if (schema.class) {
        args = array({ items: schema.arguments })
        obj = construct(classes[schema.class], args)
    }

    return _.reduce(schema.properties, function (memo, prop, key) {
        memo[key] = generate(prop, path.concat([key]), depth + 1)

        return memo
    }, obj, this)
}

function generateString (schema) {
    if (schema.pattern) {
        return new RandExp(schema.pattern).gen()
    }

    const min = schema.minLength
    const max = schema.maxLength

    let str = 'hello world'

    while(str.length <= min) {
        str = str + ' hello world'
    }

    return str.substr(0, (max !== null ? max : str.length))
}

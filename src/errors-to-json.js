import FakeJson from './placeholder'

function errorsToJson (errorDefinitions) {
    return Object.keys(errorDefinitions).map((name) => {
        const definition = errorDefinitions[name]

        if (definition.name) {
            name = definition.name
        }

        const result = Object.assign({}, definition)

        if (typeof definition.message === 'function') {
            result.message = definition.message(FakeJson(definition))
        }

        delete result.validate

        return result
    })
}

export default errorsToJson

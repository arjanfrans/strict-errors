import Ajv from 'ajv'

function createValidators (definitions) {
    const ajv = new Ajv({ allErrors: true })
    const validators = {}

    for (const errorKey of Object.keys(definitions)) {
        const definition = definitions[errorKey]
        const errorName = errorKey

        const validateSchema = ajv.compile(definition)

        validators[errorKey] = (data) => {
            const isValid = validateSchema(data)

            if (!isValid) {
                let messages = '  - '

                messages += ajv.errorsText(validateSchema.errors, {
                    separator: '\n  - '
                })

                throw new Error(`${errorName} 'data' are invalid:\n${messages}`)
            }
        }
    }

    return validators
}

const DEFAULT_OPTIONS = {
    validate: true
}

function createDefinitions (definitions, options = DEFAULT_OPTIONS) {
    const validate = options.validate
    const errorDefinitions = {}
    const validators = createValidators(definitions)

    for (const errorKey of Object.keys(definitions)) {
        const definition = definitions[errorKey]

        errorDefinitions[errorKey] = {
            ...definition,
            name: definition.name || errorKey
        }

        if (validate && validators[errorKey]) {
            errorDefinitions[errorKey].validate = validators[errorKey]
        }

        if (!definition.type) {
            definition.type = 'object'
        }
    }

    return errorDefinitions
}

export default createDefinitions

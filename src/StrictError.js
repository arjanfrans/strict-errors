function deepFreeze (obj) {
    Object.freeze(obj)

    for (const key of Object.keys(obj)) {
        const value = obj[key]

        if (typeof value === 'object') {
            deepFreeze(value)
        }
    }
}

class StrictError extends Error {
    constructor (definition, data = {}) {
        if (typeof definition.validate === 'function') {
            definition.validate(data)
        }

        let message = null

        if (typeof definition.message === 'function') {
            message = definition.message(data)
        } else {
            message = definition.message
        }

        super(message)

        this.name = definition.name
        this.data = data

        deepFreeze(this)
    }

    toJSON = () => {
        return {
            name: this.name,
            message: this.message,
            data: this.data
        }
    }
}

export default StrictError

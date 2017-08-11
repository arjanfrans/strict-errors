import { StrictError, errorsToJson } from '../src'
import ERRORS from './errors'

// Convert error definitions to object that can be parsed as JSON.
console.log(JSON.stringify(errorsToJson(ERRORS), null, 4)) // eslint-disable-line no-console

for (let i = 0; i < 3; i++) {
    if (i === 2) {
        // If you omit the required error information
        // another error will be thrown, indicating what error information is missing
        throw new StrictError(ERRORS.Example, {
            index: i
        })
    }
}


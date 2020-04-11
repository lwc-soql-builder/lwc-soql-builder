/**
 * Reduces one or more REST API or JavaScript errors into a string[] of error messages.
 * @param {FetchResponse|FetchResponse[]} errors
 * @return {String[]} Error messages
 */
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter(error => !!error)
            // Extract an error message
            .map(error => {
                // REST API errors and JS errors
                if (typeof error.message === 'string') {
                    return error.message;
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter(message => !!message)
    );
}

/**
 * Convert errors to JSON string
 *
 * @param {FetchResponse|FetchResponse[]} errors
 * @return {String} JSON String
 */
export function getErrorDetails(errors) {
    function jsonFriendlyErrorReplacer(key, value) {
        if (value instanceof Error) {
            return {
                // Pull all enumerable properties, supporting properties on custom Errors
                ...value,
                // Explicitly pull Error's non-enumerable properties
                name: value.name,
                message: value.message,
                stack: value.stack
            };
        }
        return value;
    }

    return JSON.stringify(errors, jsonFriendlyErrorReplacer, 2);
}

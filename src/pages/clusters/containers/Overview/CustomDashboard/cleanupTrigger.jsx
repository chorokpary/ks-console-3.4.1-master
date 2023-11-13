import React, { useEffect } from 'react'

const cleanupTrigger = (asyncFunction, defaultValue) => {
    const [state, setState] = React.useState({ value: defaultValue, error: null, isPending: true })

    useEffect(() => {
        const promise = (typeof asyncFunction === 'function')
            ? asyncFunction()
            : asyncFunction

        let cleanupTrigger = true
        promise
            .then(value => cleanupTrigger ? setState({ value, error: null, isPending: false }) : null)
            .catch(error => cleanupTrigger ? setState({ value: defaultValue, error: error, isPending: false }) : null)

        return () => (cleanupTrigger = false)

    }, [])

    const { value, error, isPending } = state
    return [value, error, isPending]
}

export default cleanupTrigger
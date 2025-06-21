import React from 'react'
import { logger } from 'src/util/Logger'

interface ErrorDisplayProps {
	error: Error | null
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
	logger.log('ErrorDisplay', `error=${error}`)
	if (!error) {
		return null
	}

	return (
		<div className="todo-list-error">
			<p>Oh no, something went wrong!</p>
			<pre>{error.toString()}</pre>
		</div>
	)
}

export default ErrorDisplay

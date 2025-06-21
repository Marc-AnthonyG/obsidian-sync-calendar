import React from 'react'
import { logger } from 'src/util/Logger'

const NoTaskDisplay: React.FC = () => {
	logger.log('NoTaskDisplay', 'NoTaskDisplay')
	return (
		<div className="todo-list-success">
			<p>Nothing to-do! Sit back and relax.</p>
		</div>
	)
}

export default NoTaskDisplay

import {
	type MarkdownPostProcessorContext,
	MarkdownRenderChild,
} from 'obsidian'
import React from 'react'
import { createRoot, type Root } from 'react-dom/client'

import type SyncCalendarPlugin from 'main'
import type { MainSynchronizer } from 'src/sync/MainSynchronizer'
import CalendarQuery from 'src/ui/CalendarQuery'
import ErrorDisplay from 'src/ui/ErrorDisplay'

import { parseQuery } from './Parser'
import type { Query } from './Query'
import { logger } from 'src/util/Logger'

export default class QueryInjector {
	private plugin: SyncCalendarPlugin
	private mainSync: MainSynchronizer

	constructor(plugin: SyncCalendarPlugin, mainSync: MainSynchronizer) {
		this.plugin = plugin
		this.mainSync = mainSync
	}

	onNewBlock(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext,
	) {
		const pendingQuery = {
			source: source,
			target: el,
			ctx: ctx,
		}

		this.injectQuery(pendingQuery)
	}

	injectQuery(pendingQuery: PendingQuery) {
		let child: InjectedQuery

		try {
			let query: Query
			if (pendingQuery.source.length > 0) {
				query = parseQuery(pendingQuery.source)
			}

			child = new InjectedQuery(
				pendingQuery.target,
				(root: HTMLElement) => {
					return (
						<CalendarQuery
							settings={this.plugin.settings}
							api={this.mainSync}
							query={query}
							path={pendingQuery.ctx.sourcePath}
						/>
<<<<<<< Updated upstream
					);
				},
			);
=======
					)
				}
			)
>>>>>>> Stashed changes
		} catch (err) {
			logger.log('QueryInjector', 'query error', err)

			child = new InjectedQuery(
				pendingQuery.target,
				(root: HTMLElement) => {
<<<<<<< Updated upstream
					return <ErrorDisplay error={err} />;
				},
			);
=======
					return <ErrorDisplay error={err} />
				}
			)
>>>>>>> Stashed changes
		}

		pendingQuery.ctx.addChild(child)
	}
}

interface PendingQuery {
	source: string
	target: HTMLElement
	ctx: MarkdownPostProcessorContext
}

class InjectedQuery extends MarkdownRenderChild {
	private readonly createComp: (root: HTMLElement) => React.ReactElement
	private root: Root

	constructor(
		container: HTMLElement,
		createComp: (root: HTMLElement) => React.ReactElement,
	) {
		super(container)
		this.containerEl = container
		this.createComp = createComp
	}

	onload() {
		this.root = createRoot(this.containerEl)
		this.root.render(this.createComp(this.containerEl))
	}

	onunload() {
		if (this.root) {
			this.root.unmount()
		}
	}
}

import {
	type MarkdownPostProcessorContext,
	MarkdownRenderChild,
} from "obsidian";
import React from "react";
import { createRoot, type Root } from "react-dom/client";

import type SyncCalendarPlugin from "main";
import type { MainSynchronizer } from "src/Syncs/MainSynchronizer";
import CalendarQuery from "src/ui/CalendarQuery";
import ErrorDisplay from "src/ui/ErrorDisplay";
import { logger } from "main";

import { parseQuery } from "./Parser";
import type { Query } from "./Query";

export default class QueryInjector {
	private pendingQueries: PendingQuery[];

	private plugin: SyncCalendarPlugin;
	private mainSync: MainSynchronizer;

	constructor(plugin: SyncCalendarPlugin) {
		this.plugin = plugin;
		this.pendingQueries = [];
	}

	onNewBlock(
		source: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	) {
		const pendingQuery = {
			source: source,
			target: el,
			ctx: ctx,
		};

		if (typeof this.mainSync == "undefined") {
			this.pendingQueries.push(pendingQuery);
			return;
		}

		this.injectQuery(pendingQuery);
	}

	setMainSync(mainSync: MainSynchronizer) {
		this.mainSync = mainSync;

		while (this.pendingQueries.length > 0) {
			this.injectQuery(this.pendingQueries[0]);
			this.pendingQueries.splice(0, 1);
		}
	}

	injectQuery(pendingQuery: PendingQuery) {
		let child: InjectedQuery;

		try {
			let query: Query;
			if (pendingQuery.source.length > 0) {
				query = parseQuery(pendingQuery.source);
			}

			child = new InjectedQuery(
				pendingQuery.target,
				(root: HTMLElement) => {
					return (
						<CalendarQuery
							plugin={this.plugin}
							api={this.mainSync}
							query={query}
						/>
					);
				}
			);
		} catch (err) {
			logger.log(`query error: ${err}`);

			child = new InjectedQuery(
				pendingQuery.target,
				(root: HTMLElement) => {
					return <ErrorDisplay error={err} />;
				}
			);
		}

		pendingQuery.ctx.addChild(child);
	}
}

interface PendingQuery {
	source: string;
	target: HTMLElement;
	ctx: MarkdownPostProcessorContext;
}

class InjectedQuery extends MarkdownRenderChild {
	private readonly createComp: (root: HTMLElement) => React.ReactElement;
	private root: Root;

	constructor(
		container: HTMLElement,
		createComp: (root: HTMLElement) => React.ReactElement
	) {
		super(container);
		this.containerEl = container;
		this.createComp = createComp;
	}

	onload() {
		this.root = createRoot(this.containerEl);
		this.root.render(this.createComp(this.containerEl));
	}

	onunload() {
		if (this.root) {
			this.root.unmount();
		}
	}
}

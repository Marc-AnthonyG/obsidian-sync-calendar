import React, { useEffect, useRef, useState } from "react";
import {
	MarkdownRenderer as ObsidianMarkdownRenderer,
	Component,
} from "obsidian";
import { contentStore } from "./ContentStore";

interface MarkdownRendererProps {
	eventId: string;
	className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
	eventId,
	className,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [content, setContent] = useState<string>(
		() => contentStore.get(eventId) ?? "None",
	);

	useEffect(() => {
		const renderMarkdown = async () => {
			if (!containerRef.current) return;
			containerRef.current.innerHTML = "";

			await ObsidianMarkdownRenderer.renderMarkdown(
				content,
				containerRef.current,
				"",
				new Component(),
			);

			if (containerRef.current.childElementCount > 1) {
				return;
			}
			const markdownContent = containerRef.current.querySelector("p");
			if (markdownContent) {
				markdownContent.parentElement?.removeChild(markdownContent);
				containerRef.current.innerHTML = markdownContent.innerHTML;
			}
		};

		renderMarkdown();
	}, [content]);

	useEffect(() => {
		const unsubscribe = contentStore.subscribe(eventId, (newContent) => {
			setContent(newContent);
		});

		if (contentStore.has(eventId)) {
			const currentContent = contentStore.get(eventId);
			if (currentContent) {
				setContent(currentContent);
			}
		} else {
			setContent("None");
		}

		return () => {
			unsubscribe();
		};
	}, [eventId]);

	return <div ref={containerRef} className={className} />;
};

export default MarkdownRenderer;

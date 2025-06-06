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
	const [content, setContent] = useState<string>("None");

	useEffect(() => {
		const renderMarkdown = async () => {
			if (!containerRef.current) return;
			containerRef.current.innerHTML = "";

			await ObsidianMarkdownRenderer.renderMarkdown(
				content,
				containerRef.current,
				"",
				new Component()
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
		if (!contentStore.has(eventId)) {
			contentStore.set(eventId, "None");
		}
		const newContent = contentStore.get(eventId);
		if (newContent) {
			setContent(newContent);
		}
	}, [eventId]);

	return <div ref={containerRef} className={className} />;
};

export default MarkdownRenderer;

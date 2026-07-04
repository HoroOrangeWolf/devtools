import { useCallback, useRef } from 'react';
import Draggable, { type DraggableData, type DraggableEventHandler } from 'react-draggable';
import { DropdownWrapperComponent } from '@/components/dropdownWrapper.component.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Menu } from 'lucide-react';
import { Page } from 'react-pdf';
import type { PendingAction } from '@/container/pdf/pdfWorker.container.tsx';
import { Badge } from '@/components/ui/badge.tsx';

const THUMBNAIL_WIDTH = 240;

type PdfPageThumbnailProps = {
    sourcePageNumber: number;
    position: number;
    onElementChange: (sourcePageNumber: number, element: HTMLDivElement | null) => void;
	onDragStart: (sourcePageNumber: number) => void;
	onDrag: (sourcePageNumber: number, data: DraggableData) => void;
	onDrop: (sourcePageNumber: number) => void;
    onOpenAction: (action: PendingAction) => void;
    onOpenPreview: (sourcePageNumber: number, position: number) => void;
};


export const PdfPageThumbnail = ({
	sourcePageNumber,
	position,
	onElementChange,
	onDragStart,
	onDrag,
	onDrop,
	onOpenAction,
	onOpenPreview,
}: PdfPageThumbnailProps) => {
	const nodeRef = useRef<HTMLDivElement>(null);
	const suppressPreviewRef = useRef(false);
	const setNodeRef = useCallback((element: HTMLDivElement | null) => {
		nodeRef.current = element;
		onElementChange(sourcePageNumber, element);
	}, [onElementChange, sourcePageNumber]);

	const handleDragStop: DraggableEventHandler = (_, data) => {
		const didMove = data.x !== 0 || data.y !== 0;
		suppressPreviewRef.current = didMove;
		onDrop(sourcePageNumber);

		if (didMove) {
			globalThis.setTimeout(() => {
				suppressPreviewRef.current = false;
			}, 0);
		}
	};

	const handlePreviewClick = () => {
		if (suppressPreviewRef.current) {
			return;
		}

		onOpenPreview(sourcePageNumber, position);
	};

	return (
		<Draggable
			nodeRef={nodeRef}
			bounds="parent"
			cancel="[data-pdf-page-menu]"
			position={{ x: 0, y: 0 }}
			defaultClassName="cursor-grab touch-none"
			defaultClassNameDragging="z-50 cursor-grabbing opacity-90 shadow-xl"
			onStart={() => onDragStart(sourcePageNumber)}
			onDrag={(_, data) => onDrag(sourcePageNumber, data)}
			onStop={handleDragStop}
		>
			<div
				ref={setNodeRef}
				className="group/pdf-thumbnail relative h-full"
				data-page-position={position}
				data-source-page-number={sourcePageNumber}
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute top-2 bottom-2 z-20 hidden w-1 rounded-full bg-primary shadow-sm group-data-[drop-indicator=before]/pdf-thumbnail:-left-2 group-data-[drop-indicator=before]/pdf-thumbnail:block group-data-[drop-indicator=after]/pdf-thumbnail:-right-2 group-data-[drop-indicator=after]/pdf-thumbnail:block"
					data-pdf-drop-indicator
				/>
				<div
					className="flex h-full items-center justify-center rounded-lg border bg-secondary p-3"
					data-pdf-thumbnail-frame
				>
					<div
						className="absolute top-0 right-0 z-10 translate-x-1/2 -translate-y-1/3"
						data-pdf-page-menu
					>
						<DropdownWrapperComponent
							options={[
								{
									label: 'Remove',
									onClick: () => onOpenAction({ type: 'remove', index: position }),
								},
								{
									label: 'Move To',
									onClick: () => onOpenAction({ type: 'move', index: position }),
								},
								{
									label: 'Replace With',
									onClick: () => onOpenAction({ type: 'replace', index: position }),
								},
							]}
						>
							<Button
								type="button"
								className="h-auto rounded-full bg-card p-0.5 dark:bg-card"
								variant="outline"
								aria-label={`Actions for page ${position + 1}`}
							>
								<Menu />
							</Button>
						</DropdownWrapperComponent>
					</div>
					<button
						type="button"
						className="block cursor-zoom-in"
						onClick={handlePreviewClick}
						aria-label={`View page ${position + 1}`}
					>
						<Page
							renderTextLayer={false}
							renderAnnotationLayer={false}
							pageNumber={sourcePageNumber}
							width={THUMBNAIL_WIDTH}
						/>
					</button>
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
						<Badge
							className="bg-card dark:bg-card"
							variant="outline"
						>
							{position + 1}
						</Badge>
					</div>
				</div>
			</div>
		</Draggable>
	);
};

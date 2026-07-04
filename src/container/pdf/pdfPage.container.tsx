import { useCallback, useRef } from 'react';
import Draggable, { type DraggableData, DraggableEventHandler } from 'react-draggable';
import { DropdownWrapperComponent } from '@/components/dropdownWrapper.component.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Menu } from 'lucide-react';
import { Page } from 'react-pdf';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { PendingAction } from '@/container/pdf/pdfWorker.container.tsx';

type PdfPageThumbnailProps = {
    sourcePageNumber: number;
    position: number;
    onElementChange: (sourcePageNumber: number, element: HTMLDivElement | null) => void;
    onDrop: (sourcePageNumber: number, data: DraggableData) => void;
    onOpenAction: (action: PendingAction) => void;
};


export const PdfPageThumbnail = ({
	sourcePageNumber,
	position,
	onElementChange,
	onDrop,
	onOpenAction,
}: PdfPageThumbnailProps) => {
	const nodeRef = useRef<HTMLDivElement>(null);
	const setNodeRef = useCallback((element: HTMLDivElement | null) => {
		nodeRef.current = element;
		onElementChange(sourcePageNumber, element);
	}, [onElementChange, sourcePageNumber]);
	const handleDragStop: DraggableEventHandler = (_, data) => {
		onDrop(sourcePageNumber, data);
	};

	return (
		<Draggable
			nodeRef={nodeRef}
			bounds="parent"
			cancel="[data-pdf-page-menu]"
			position={{ x: 0, y: 0 }}
			defaultClassName="cursor-grab touch-none"
			defaultClassNameDragging="z-50 cursor-grabbing opacity-90 shadow-xl"
			onStop={handleDragStop}
		>
			<div
				ref={setNodeRef}
				className="relative"
				data-page-position={position}
				data-source-page-number={sourcePageNumber}
			>
				<div className="flex h-full items-center justify-center rounded-lg border bg-secondary p-3">
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
					<Page
						className={cn('aspect-1/1.414 h-full w-full')}
						renderTextLayer={false}
						scale={0.25}
						renderAnnotationLayer={false}
						pageNumber={sourcePageNumber}
					/>
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
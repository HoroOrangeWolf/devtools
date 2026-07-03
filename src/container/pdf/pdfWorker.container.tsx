import { useCallback, useRef, useState } from 'react';
import Draggable, { type DraggableData, type DraggableEventHandler } from 'react-draggable';
import { Document, Page, pdfjs } from 'react-pdf';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import { Menu } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import { DropdownWrapperComponent } from '@/components/dropdownWrapper.component.tsx';
import { cn } from '@/lib/utils.ts';
import { PagePositionDialogContainer } from '@/container/pdf/dialogs/pagePositionDialog.container.tsx';
import { DeleteDialogContainer } from '@/container/pdf/dialogs/deleteDialog.container.tsx';

export type PdfPageAction =
	| { type: 'remove'; index: number }
	| { type: 'move'; fromIndex: number; toIndex: number }
	| { type: 'replace'; firstIndex: number; secondIndex: number };

export type PdfPageActionHandler = (action: PdfPageAction) => void;

export type PdfWorkerContainerProps = {
	file: File;
	onDocumentLoad: (document: DocumentCallback) => void;
	onPageAction?: PdfPageActionHandler;
};

export type PendingAction = {
	type: 'move' | 'remove' | 'replace';
	index: number;
};

type PdfPageThumbnailProps = {
	sourcePageNumber: number;
	position: number;
	onElementChange: (sourcePageNumber: number, element: HTMLDivElement | null) => void;
	onDrop: (sourcePageNumber: number, data: DraggableData) => void;
	onOpenAction: (action: PendingAction) => void;
};

const movePage = (pages: number[], fromIndex: number, toIndex: number) => {
	const nextPages = [...pages];
	const [page] = nextPages.splice(fromIndex, 1);

	if (page === undefined) {
		return pages;
	}

	nextPages.splice(toIndex, 0, page);
	return nextPages;
};

const swapPages = (pages: number[], firstIndex: number, secondIndex: number) => {
	const nextPages = [...pages];
	[nextPages[firstIndex], nextPages[secondIndex]] = [nextPages[secondIndex], nextPages[firstIndex]];
	return nextPages;
};

const PdfPageThumbnail = ({
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

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.mjs`;

export const PdfWorkerContainer = ({
	onDocumentLoad,
	onPageAction,
	file,
}: PdfWorkerContainerProps) => {
	const [pageOrder, setPageOrder] = useState<number[]>([]);
	const [pendingAction, setPendingAction] = useState<PendingAction>();
	const [validationError, setValidationError] = useState('');
	const pageElementsRef = useRef(new Map<number, HTMLDivElement>());

	const closeAction = useCallback(() => {
		setPendingAction(undefined);
		setValidationError('');
	}, []);

	const handleDocumentLoad = useCallback((document: DocumentCallback) => {
		pageElementsRef.current.clear();
		setPageOrder(Array.from({ length: document.numPages }, (_, index) => index + 1));
		closeAction();
		onDocumentLoad(document);
	}, [closeAction, onDocumentLoad]);

	const handleElementChange = useCallback((sourcePageNumber: number, element: HTMLDivElement | null) => {
		if (element) {
			pageElementsRef.current.set(sourcePageNumber, element);
			return;
		}

		pageElementsRef.current.delete(sourcePageNumber);
	}, []);

	const moveAndEmit = useCallback((fromIndex: number, toIndex: number) => {
		if (fromIndex === toIndex) {
			return;
		}

		setPageOrder((pages) => movePage(pages, fromIndex, toIndex));
		onPageAction?.({ type: 'move', fromIndex, toIndex });
	}, [onPageAction]);

	const handlePageDrop = useCallback((sourcePageNumber: number, data: DraggableData) => {
		const sourceIndex = pageOrder.indexOf(sourcePageNumber);
		const sourceElement = pageElementsRef.current.get(sourcePageNumber);

		if (sourceIndex === -1 || !sourceElement) {
			return;
		}

		const sourceRectangle = sourceElement.getBoundingClientRect();
		const draggedCenter = {
			x: sourceRectangle.left + sourceRectangle.width / 2,
			y: sourceRectangle.top + sourceRectangle.height / 2,
		};
		let targetIndex = sourceIndex;
		let closestDistance = data.x ** 2 + data.y ** 2;

		for (const [index, pageNumber] of pageOrder.entries()) {
			if (index === sourceIndex) {
				continue;
			}

			const targetElement = pageElementsRef.current.get(pageNumber);

			if (!targetElement) {
				continue;
			}

			const targetRectangle = targetElement.getBoundingClientRect();
			const horizontalDistance = draggedCenter.x - (targetRectangle.left + targetRectangle.width / 2);
			const verticalDistance = draggedCenter.y - (targetRectangle.top + targetRectangle.height / 2);
			const distance = horizontalDistance ** 2 + verticalDistance ** 2;

			if (distance < closestDistance) {
				closestDistance = distance;
				targetIndex = index;
			}
		}

		moveAndEmit(sourceIndex, targetIndex);
	}, [moveAndEmit, pageOrder]);

	const openAction = useCallback((action: PendingAction) => {
		setPendingAction(action);
		setValidationError('');
	}, []);

	const handleRemove = () => {
		if (pendingAction?.type !== 'remove') {
			return;
		}

		const { index } = pendingAction;
		setPageOrder((pages) => pages.filter((_, pageIndex) => pageIndex !== index));
		onPageAction?.({ type: 'remove', index });
		closeAction();
	};

	const handleTargetSubmit = (position: number) => {
		if (!pendingAction || pendingAction.type === 'remove') {
			return;
		}

		if (!Number.isInteger(position) || position < 1 || position > pageOrder.length) {
			setValidationError(`Enter a whole number from 1 to ${pageOrder.length}.`);
			return;
		}

		const targetIndex = position - 1;

		if (targetIndex === pendingAction.index) {
			setValidationError('Choose a different page position.');
			return;
		}

		if (pendingAction.type === 'move') {
			moveAndEmit(pendingAction.index, targetIndex);
		} else {
			const firstIndex = pendingAction.index;
			setPageOrder((pages) => swapPages(pages, firstIndex, targetIndex));
			onPageAction?.({ type: 'replace', firstIndex, secondIndex: targetIndex });
		}

		closeAction();
	};

	const renderDialog = () => {
		switch (pendingAction?.type) {
			case 'replace':
			case 'move': {
				return (
					<PagePositionDialogContainer
						onClose={closeAction}
						validationError={validationError}
						onSubmit={handleTargetSubmit}
						pendingAction={pendingAction}
						maxLength={pageOrder.length}
						isReplace={pendingAction?.type === 'replace'}
					/>
				);
			}
			case 'remove': {
				return (
					<DeleteDialogContainer
						pendingAction={pendingAction}
						onSubmit={handleRemove}
						onClose={closeAction}
					/>
				);
			}
		}
	};

	return (
		<>
			<Document
				file={file}
				onLoadSuccess={handleDocumentLoad}
			>
				<div className="grid grid-cols-[repeat(auto-fit,10rem)] justify-between gap-4">
					{pageOrder.map((sourcePageNumber, position) => (
						<PdfPageThumbnail
							key={sourcePageNumber}
							sourcePageNumber={sourcePageNumber}
							position={position}
							onElementChange={handleElementChange}
							onDrop={handlePageDrop}
							onOpenAction={openAction}
						/>
					))}
				</div>
			</Document>
			{renderDialog()}
		</>
	);
};

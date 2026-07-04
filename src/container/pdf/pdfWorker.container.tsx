import { useCallback, useEffect, useRef, useState } from 'react';
import { type DraggableData } from 'react-draggable';
import { Document, pdfjs } from 'react-pdf';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import { PagePositionDialogContainer } from '@/container/pdf/dialogs/pagePositionDialog.container.tsx';
import { DeleteDialogContainer } from '@/container/pdf/dialogs/deleteDialog.container.tsx';
import { PdfPagePreviewDialogContainer } from '@/container/pdf/dialogs/pdfPagePreviewDialog.container.tsx';
import { PdfPageThumbnail } from '@/container/pdf/pdfPage.container.tsx';

export type PdfPageActionHandler = (pages: number[]) => void;

export type PdfWorkerContainerProps = {
	file: File;
	onPageOrderChange?: PdfPageActionHandler;
};

export type PendingAction = {
	type: 'move' | 'remove' | 'replace';
	index: number;
};

type PreviewPage = {
	sourcePageNumber: number;
	position: number;
};

type DragOrigin = {
	sourcePageNumber: number;
	center: {
		x: number;
		y: number;
	};
};

type DropIndicator = 'before' | 'after';

type DropTarget = {
	targetPageNumber: number;
	indicator: DropIndicator;
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

const insertPage = (
	pages: number[],
	sourcePageNumber: number,
	targetPageNumber: number,
	indicator: DropIndicator,
) => {
	const nextPages = pages.filter((pageNumber) => pageNumber !== sourcePageNumber);
	const targetIndex = nextPages.indexOf(targetPageNumber);

	if (nextPages.length === pages.length || targetIndex === -1) {
		return pages;
	}

	const insertionIndex = targetIndex + (indicator === 'after' ? 1 : 0);
	nextPages.splice(insertionIndex, 0, sourcePageNumber);

	return nextPages.every((pageNumber, index) => pageNumber === pages[index]) ? pages : nextPages;
};

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.mjs`;

export const PdfWorkerContainer = ({
	onPageOrderChange,
	file,
}: PdfWorkerContainerProps) => {
	const [pageOrder, setPageOrder] = useState<number[]>([]);
	const [pendingAction, setPendingAction] = useState<PendingAction>();
	const [previewPage, setPreviewPage] = useState<PreviewPage>();
	const [validationError, setValidationError] = useState('');
	const pageElementsRef = useRef(new Map<number, HTMLDivElement>());
	const dragOriginRef = useRef<DragOrigin>(undefined);
	const dropTargetRef = useRef<DropTarget>(undefined);

	const closeAction = useCallback(() => {
		setPendingAction(undefined);
		setValidationError('');
	}, []);

	const updateDropTarget = useCallback((target?: DropTarget) => {
		const currentTarget = dropTargetRef.current;

		if (
			currentTarget?.targetPageNumber === target?.targetPageNumber
			&& currentTarget?.indicator === target?.indicator
		) {
			return;
		}

		if (currentTarget) {
			const currentElement = pageElementsRef.current.get(currentTarget.targetPageNumber);
			currentElement?.removeAttribute('data-drop-indicator');
		}

		if (target) {
			const targetElement = pageElementsRef.current.get(target.targetPageNumber);
			targetElement?.setAttribute('data-drop-indicator', target.indicator);
		}

		dropTargetRef.current = target;
	}, []);

	const clearDragState = useCallback(() => {
		dragOriginRef.current = undefined;
		updateDropTarget();
	}, [updateDropTarget]);

	useEffect(() => {
		onPageOrderChange?.(pageOrder);
	}, [onPageOrderChange, pageOrder]);

	const handleDocumentLoad = useCallback((document: DocumentCallback) => {
		setPageOrder(Array.from({ length: document.numPages }, (_, index) =>  index + 1));
		setPreviewPage(undefined);
		clearDragState();
		closeAction();
	}, [clearDragState, closeAction]);

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
	}, []);

	const handlePageDragStart = useCallback((sourcePageNumber: number) => {
		const sourceElement = pageElementsRef.current.get(sourcePageNumber);

		updateDropTarget();

		if (!sourceElement) {
			dragOriginRef.current = undefined;
			return;
		}

		const sourceRectangle = sourceElement.getBoundingClientRect();
		dragOriginRef.current = {
			sourcePageNumber,
			center: {
				x: sourceRectangle.left + sourceRectangle.width / 2,
				y: sourceRectangle.top + sourceRectangle.height / 2,
			},
		};
	}, [updateDropTarget]);

	const handlePageDrag = useCallback((sourcePageNumber: number, data: DraggableData) => {
		const dragOrigin = dragOriginRef.current;

		if (!dragOrigin || dragOrigin.sourcePageNumber !== sourcePageNumber) {
			updateDropTarget();
			return;
		}

		const draggedCenter = {
			x: dragOrigin.center.x + data.x,
			y: dragOrigin.center.y + data.y,
		};
		let closestDistance = (draggedCenter.x - dragOrigin.center.x) ** 2
			+ (draggedCenter.y - dragOrigin.center.y) ** 2;
		let nextDropTarget: DropTarget | undefined;

		for (const pageNumber of pageOrder) {
			if (pageNumber === sourcePageNumber) {
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
				nextDropTarget = {
					targetPageNumber: pageNumber,
					indicator: draggedCenter.x < targetRectangle.left + targetRectangle.width / 2
						? 'before'
						: 'after',
				};
			}
		}

		updateDropTarget(nextDropTarget);
	}, [pageOrder, updateDropTarget]);

	const handlePageDrop = useCallback((sourcePageNumber: number) => {
		const target = dropTargetRef.current;
		const dragOrigin = dragOriginRef.current;

		if (target && dragOrigin?.sourcePageNumber === sourcePageNumber) {
			setPageOrder((pages) => insertPage(
				pages,
				sourcePageNumber,
				target.targetPageNumber,
				target.indicator,
			));
		}

		clearDragState();
	}, [clearDragState]);

	const openAction = useCallback((action: PendingAction) => {
		setPendingAction(action);
		setValidationError('');
	}, []);

	const openPreview = useCallback((sourcePageNumber: number, position: number) => {
		setPreviewPage({ sourcePageNumber, position });
	}, []);

	const handleRemove = () => {
		if (pendingAction?.type !== 'remove') {
			return;
		}

		const { index } = pendingAction;
		setPageOrder((pages) => pages.filter((_, pageIndex) => pageIndex !== index));
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
				<>
					<div className="grid grid-cols-[repeat(auto-fit,15rem)] items-stretch justify-between gap-4">
						{pageOrder.map((sourcePageNumber, position) => (
							<PdfPageThumbnail
								key={sourcePageNumber}
								sourcePageNumber={sourcePageNumber}
								position={position}
								onElementChange={handleElementChange}
								onDragStart={handlePageDragStart}
								onDrag={handlePageDrag}
								onDrop={handlePageDrop}
								onOpenAction={openAction}
								onOpenPreview={openPreview}
							/>
						))}
					</div>
					{previewPage && (
						<PdfPagePreviewDialogContainer
							sourcePageNumber={previewPage.sourcePageNumber}
							position={previewPage.position}
							onClose={() => setPreviewPage(undefined)}
						/>
					)}
				</>
			</Document>
			{renderDialog()}
		</>
	);
};

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

	const closeAction = useCallback(() => {
		setPendingAction(undefined);
		setValidationError('');
	}, []);

	useEffect(() => {
		onPageOrderChange?.(pageOrder);
	}, [onPageOrderChange, pageOrder]);

	const handleDocumentLoad = useCallback((document: DocumentCallback) => {
		setPageOrder(Array.from({ length: document.numPages }, (_, index) =>  index + 1));
		setPreviewPage(undefined);
		closeAction();
	}, [closeAction]);

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
					<div className="grid grid-cols-[repeat(auto-fit,10rem)] justify-between gap-4">
						{pageOrder.map((sourcePageNumber, position) => (
							<PdfPageThumbnail
								key={sourcePageNumber}
								sourcePageNumber={sourcePageNumber}
								position={position}
								onElementChange={handleElementChange}
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

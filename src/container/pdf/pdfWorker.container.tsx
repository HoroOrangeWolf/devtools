import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import { useState } from 'react';
import { cn } from '@/lib/utils.ts';

type PropsType = {
    pageNumber: number;
    file: File;
    onDocumentLoad: (document: DocumentCallback) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.mjs`;

export const PdfWorkerContainer = ({ onDocumentLoad, pageNumber, file }: PropsType) => {
	const [loadedDocument, setLoadedDocument] = useState<DocumentCallback>();

	const pages = loadedDocument?.numPages ?? 0;

	return (
		<Document file={file} onLoadSuccess={setLoadedDocument}>
			<div className={cn('grid grid-cols-[repeat(auto-fit,10rem)] justify-between gap-2')}>
				{Array.from({ length: pages }, ()=>null).map((_, i) => (
					<div key={i}>
						<Page
							className={cn('aspect-1/1.414 h-full w-full')}
							renderTextLayer={false}
							scale={0.25}
							renderAnnotationLayer={false}
							pageNumber={i + 1}
						/>
					</div>
				))}
			</div>
		</Document>
	);
};
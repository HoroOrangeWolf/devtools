import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/shared/types.js';

type PropsType = {
    pageNumber: number;
    file: File;
    onDocumentLoad: (document: DocumentCallback) => void;
}

pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.mjs`;

export const PdfWorkerContainer = ({ onDocumentLoad, pageNumber, file }: PropsType) => {
	return (
		<Document file={file} onLoadSuccess={onDocumentLoad}>
			<Page pageNumber={pageNumber} />
		</Document>
	);
};
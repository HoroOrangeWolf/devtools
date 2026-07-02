import { FunctionComponent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { FileService } from '@/service/file.service.ts';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import type {
	PdfPageActionHandler,
	PdfWorkerContainerProps,
} from '@/container/pdf/pdfWorker.container.tsx';

type PropsType = {
	onPageAction?: PdfPageActionHandler;
};

export const PdfContainer = ({ onPageAction }: PropsType) => {
	const [file, setFile] = useState<File>();
	const [numPages, setNumPages] = useState<number>();
	const [pageNumber,] = useState<number>(1);
	const [PdfWrapper, setPdfContainer] = useState<FunctionComponent<PdfWorkerContainerProps> | null>(null);

	useEffect(() => {
		import('./pdfWorker.container.tsx').then(({ PdfWorkerContainer }) => {
			setPdfContainer(() => PdfWorkerContainer);
		});
	}, []);

	const onDocumentLoadSuccess = ({ numPages }: DocumentCallback): void => {
		setNumPages(numPages);
	};

	return (
		<div>
			{file && PdfWrapper && (
				<PdfWrapper
					file={file}
					onDocumentLoad={onDocumentLoadSuccess}
					onPageAction={onPageAction}
				/>
			)}
			<p>
				Page {pageNumber} of {numPages}
			</p>
			<Button
				onClick={async () => {
					const file = await 	FileService.getFileContent() as File;
					setFile(file);
				}}
			>
				Upload
			</Button>
		</div>
	);
};

import { FunctionComponent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { FileService } from '@/service/file.service.ts';

export const PdfContainer = () => {
	const [file, setFile] = useState<File>();
	const [numPages, setNumPages] = useState<number>();
	const [pageNumber,] = useState<number>(1);
	const [PdfWrapper, setPdfContainer] = useState<FunctionComponent<any> | null>(null);

	useEffect(() => {
		import('./pdfWorker.container.tsx').then(({ PdfWorkerContainer }) => {
			setPdfContainer(() => PdfWorkerContainer);
		});
	}, []);

	const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
		setNumPages(numPages);
	};

	return (
		<div>
			{file && PdfWrapper && (
				<PdfWrapper
					file={file}
					pageNumber={pageNumber}
					odDocumentLoad={onDocumentLoadSuccess}
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
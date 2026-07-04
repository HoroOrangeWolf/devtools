import { FunctionComponent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { FileService } from '@/service/file.service.ts';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import type {
	PdfPageActionHandler,
	PdfWorkerContainerProps,
} from '@/container/pdf/pdfWorker.container.tsx';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';
import { ToastUtils } from '@/utils/toast.utils.ts';
import { PdfService } from '@/container/pdf/pdf.service.ts';
import { UploadIcon } from 'lucide-react';

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

	const onDropFIle = async (droppedFile: File) => {
		try {
			if (!file) {
				setFile(droppedFile);
				return;
			}

			const contactedFile = await PdfService.concatPdfFiles(file, droppedFile);

			setFile(contactedFile);
		} catch (error) {
			console.error('Failed to drop file', error);
			ToastUtils.error('Failed to drop file');
		}
	};

	const renderDropzoneChild = () => {
		if (file && PdfWrapper) {
			return (
				<PdfWrapper
					file={file}
					onDocumentLoad={onDocumentLoadSuccess}
					onPageAction={onPageAction}
				/>
			);
		}

		return null;
	};

	return (
		<div className="flex flex-col gap-2">
			<FileDropzone
				className="min-h-80"
				displayShadow={!file}
				onDropFile={onDropFIle}
				accept={['.pdf', 'application/pdf']}
			>
				{renderDropzoneChild()}
			</FileDropzone>
			<div className="flex flex-row justify-end">
				<Button
					onClick={async () => {
						const file = await FileService.getFileContent() as File;
						await onDropFIle(file);
					}}
				>
					<UploadIcon /> Upload
				</Button>
			</div>
		</div>
	);
};

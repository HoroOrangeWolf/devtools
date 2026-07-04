import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { FileService } from '@/service/file.service.ts';
import type {
	PdfWorkerContainerProps,
} from '@/container/pdf/pdfWorker.container.tsx';
import { FileDropzone } from '@/components/csvFileDropzone.component.tsx';
import { ToastUtils } from '@/utils/toast.utils.ts';
import { PdfService } from '@/container/pdf/pdf.service.ts';
import { DownloadIcon, UploadIcon } from 'lucide-react';
import { ButtonGroup } from '@/components/ui/button-group.tsx';

export const PdfContainer = () => {
	const [file, setFile] = useState<File>();
	const [pageOrder, setPageOrder] = useState<number[]>([]);
	const [PdfWrapper, setPdfContainer] = useState<FunctionComponent<PdfWorkerContainerProps> | null>(null);

	useEffect(() => {
		import('./pdfWorker.container.tsx').then(({ PdfWorkerContainer }) => {
			setPdfContainer(() => PdfWorkerContainer);
		});
	}, []);

	const onDropFile = useCallback(async (droppedFile: File) => {
		try {
			if (!file) {
				setFile(droppedFile);
				return;
			}

			const shuffledPdf = await PdfService.shufflePdf(file, pageOrder);

			const contactedFile = await PdfService.concatPdfFiles(shuffledPdf, droppedFile);

			setFile(contactedFile);
		} catch (error) {
			console.error('Failed to drop file', error);
			ToastUtils.error(`Failed to drop file with error "${(error as Error).message}"`);
		}
	},[setFile, pageOrder, file]);

	const renderDropzoneChild = () => {
		if (file && PdfWrapper) {
			return (
				<PdfWrapper
					file={file}
					onPageOrderChange={setPageOrder}
				/>
			);
		}

		return null;
	};

	const handleUploadClick = useCallback(async () => {
		try {
			const file = await FileService.getFileContent() as File;
			await onDropFile(file);
		} catch (error) {
			console.error('Failed to drop file', error);
			throw error;
		}
	},[onDropFile]);

	const handleDownload = useCallback(async () => {
		try {
			if (!file) {
				return;
			}

			const shuffledPages = await PdfService.shufflePdf(file, pageOrder);

			await FileService.downloadFileContent(shuffledPages);
		} catch (error) {
			console.error('Failed to download file', error);
			throw error;
		}
	},[file, pageOrder]);

	return (
		<div className="flex flex-col gap-2">
			<FileDropzone
				className="min-h-80"
				displayShadow={!file}
				onDropFile={onDropFile}
				accept={['.pdf', 'application/pdf']}
			>
				{renderDropzoneChild()}
			</FileDropzone>
			<div className="flex flex-row justify-end">
				<ButtonGroup>
					<Button
						disabled={!file}
						onClick={handleDownload}
					>
						<DownloadIcon /> Download
					</Button>
					<Button
						onClick={handleUploadClick}
					>
						<UploadIcon /> Upload
					</Button>
				</ButtonGroup>
			</div>
		</div>
	);
};

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Page } from 'react-pdf';

type PdfPagePreviewDialogContainerProps = {
	sourcePageNumber: number;
	position: number;
	onClose: () => void;
};

export const PdfPagePreviewDialogContainer = ({
	sourcePageNumber,
	position,
	onClose,
}: PdfPagePreviewDialogContainerProps) => (
	<Dialog
		open={true}
		onOpenChange={(open) => open || onClose()}
	>
		<DialogContent className="max-h-[calc(100vh-2rem)] max-w-4xl overflow-hidden">
			<DialogHeader>
				<DialogTitle>Page {position + 1} preview</DialogTitle>
				<DialogDescription>
					Larger view of the selected PDF page.
				</DialogDescription>
			</DialogHeader>
			<div className="min-w-0 overflow-auto rounded-lg border bg-secondary p-3">
				<Page
					pageNumber={sourcePageNumber}
					scale={1.25}
					renderTextLayer={false}
					renderAnnotationLayer={false}
				/>
			</div>
		</DialogContent>
	</Dialog>
);

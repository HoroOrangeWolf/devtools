import { PageWrapper } from '@/components/pageWrapper.component.tsx';
import { PdfContainer } from '@/container/pdf/pdf.container.tsx';
import type { PdfPageActionHandler } from '@/container/pdf/pdfWorker.container.tsx';

type PropsType = {
	onPageAction?: PdfPageActionHandler;
};

export const PdfRoot = ({ onPageAction }: PropsType) => (
	<PageWrapper>
		<PdfContainer onPageAction={onPageAction} />
	</PageWrapper>
);

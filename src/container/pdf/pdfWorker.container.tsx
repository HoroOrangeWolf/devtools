import { Document, Page, pdfjs } from 'react-pdf';
import { DocumentCallback } from 'react-pdf/dist/shared/types.js';
import { useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { DropdownWrapperComponent } from '@/components/dropdownWrapper.component.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Menu } from 'lucide-react';

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
			<div className={cn('grid grid-cols-[repeat(auto-fit,10rem)] justify-between gap-4')}>
				{Array.from({ length: pages }, ()=>null).map((_, i) => (
					<div key={i} className={cn('relative')}>
						<div className={cn('bg-secondary p-3 flex align-center justify-center rounded-lg border')}>
							<div className={cn('absolute top-0 right-0 translate-x-1/2 -translate-y-1/3 translate-z-96')}>
								<DropdownWrapperComponent
									options={
										[
											{
												label: 'Remove',
												onClick: () => {
													console.log('Test',123);
												}
											},
											{
												label: 'Move To',
												onClick: () => {
													console.log('Test',123);
												}
											},
											{
												label: 'Replace With',
												onClick: () => {
													console.log('Test',123);
												}
											}
										]
									}
								>
									<Button className={cn('rounded-full h-auto p-0.5 bg-card dark:bg-card')} variant="outline">
										<Menu />
									</Button>
								</DropdownWrapperComponent>
							</div>
							<Page
								className={cn('aspect-1/1.414 h-full w-full')}
								renderTextLayer={false}
								scale={0.25}
								renderAnnotationLayer={false}
								pageNumber={i + 1}
							/>
							<div className={cn('absolute left-1/2 bottom-0 translate-y-1/2 -translate-x-1/2')}>
								<Badge className={cn('bg-card dark:bg-card')} variant="outline">
									{i + 1}
								</Badge>
							</div>
						</div>
					</div>
				))}
			</div>
		</Document>
	);
};
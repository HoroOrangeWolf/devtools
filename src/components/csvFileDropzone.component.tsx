import type { DragEvent, ReactNode } from 'react';
import { useState } from 'react';
import { UploadIcon } from 'lucide-react';

import { cn } from '@/lib/utils.ts';

type CsvFileDropzoneProps = {
	onDropFile: (file: File) => void | Promise<void>;
	children: ReactNode;
	className?: string;
};

const hasFiles = (event: DragEvent<HTMLDivElement>) =>
	Array.from(event.dataTransfer.types).includes('Files');

export const FileDropzone = ({ onDropFile, children, className }: CsvFileDropzoneProps) => {
	const [isActive, setIsActive] = useState(false);
	const [, setDragDepth] = useState(0);

	return (
		<div
			onDragEnter={(event) => {
				if (!hasFiles(event)) {
					return;
				}

				event.preventDefault();
				setDragDepth((previous) => previous + 1);
				setIsActive(true);
			}}
			onDragOver={(event) => {
				if (!hasFiles(event)) {
					return;
				}

				event.preventDefault();
				event.dataTransfer.dropEffect = 'copy';
				setIsActive(true);
			}}
			onDragLeave={(event) => {
				if (!hasFiles(event)) {
					return;
				}

				event.preventDefault();
				setDragDepth((previous) => {
					const nextDepth = Math.max(0, previous - 1);

					if (nextDepth === 0) {
						setIsActive(false);
					}

					return nextDepth;
				});
			}}
			onDrop={async (event) => {
				if (!hasFiles(event)) {
					return;
				}

				event.preventDefault();
				event.stopPropagation();
				setDragDepth(0);
				setIsActive(false);

				const file = event.dataTransfer.files?.[0];

				if (!file) {
					return;
				}

				await onDropFile(file);
			}}
			className={cn('relative', className)}
		>
			{children}
			<div
				className={cn(
					'pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border border-dashed border-transparent bg-transparent text-transparent opacity-0 transition-all',
					isActive && 'border-primary/70 bg-primary/10 text-primary opacity-100'
				)}
			>
				<div className="flex flex-col items-center gap-2">
					<UploadIcon className="size-5" />
					<span className="text-sm font-medium">Drop file here</span>
				</div>
			</div>
		</div>
	);
};

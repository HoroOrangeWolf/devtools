import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { PendingAction } from '@/container/pdf/pdfWorker.container.tsx';
import { useState } from 'react';

type PropsType = {
    onClose: () => void;
    onSubmit: (position: number) => void;
    pendingAction: PendingAction;
    validationError?: string;
    maxLength: number;
    isReplace: boolean;
}

export const PagePositionDialogContainer = ({
	onClose,
	onSubmit,
	pendingAction,
	validationError,
	maxLength,
}: PropsType) => {
	const [position, setPosition] = useState<string>('');
	const actionLabel = pendingAction?.type === 'replace' ? 'Replace' : 'Move';

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		onSubmit(Number(position));
	};

	return (
		<Dialog
			open={true}
			onOpenChange={(open) => open || onClose() }
		>
			<DialogContent>
				<form
					className="grid gap-4"
					onSubmit={handleSubmit}
				>
					<DialogHeader>
						<DialogTitle>{actionLabel} page {pendingAction?.index}</DialogTitle>
						<DialogDescription>
							{pendingAction?.type === 'replace'
								? 'Choose a page position to swap with this page.'
								: 'Choose the position where this page should be moved.'}
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-2">
						<Input
							type="number"
							min={1}
							max={maxLength}
							step={1}
							value={position}
							onChange={(e)=>{
								setPosition(e.target.value);
							}}
							placeholder={`Page position (1-${maxLength})`}
							aria-label="Target page position"
							aria-invalid={Boolean(validationError)}
							autoFocus
						/>
						{validationError && (
							<p className="text-sm text-destructive">{validationError}</p>
						)}
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
							>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit">{actionLabel}</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
import {
	AlertDialog, AlertDialogAction, AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription, AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog.tsx';
import { cn } from '@/lib/utils.ts';
import { PendingAction } from '@/container/pdf/pdfWorker.container.tsx';

type PropsType = {
    pendingAction: PendingAction;
    onSubmit: () => void;
    onClose: () => void;
}

export const DeleteDialogContainer = ({ onClose, onSubmit, pendingAction }: PropsType) => {
	const sourcePosition = pendingAction.index;

	return (
		<AlertDialog
			open={true}
			onOpenChange={(open) => open || onClose() }
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove page {sourcePosition}?</AlertDialogTitle>
					<AlertDialogDescription>
						This removes the page from the current page order.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						className={cn('bg-destructive text-white hover:bg-destructive/90')}
						onClick={onSubmit}
					>
						Remove
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
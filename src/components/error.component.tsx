import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

type PropsType = {
    title?: string;
    children?: React.ReactNode;
	className?: string;
}

export const ErrorBanner = ({ title, children, className }: PropsType) => (
	<Alert
		variant="destructive"
		className={cn('w-full', className)}
	>
		<AlertCircleIcon />
		<AlertTitle>{title}</AlertTitle>
		<AlertDescription>
			{children}
		</AlertDescription>
	</Alert>
);
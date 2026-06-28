import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertCircleIcon, InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

type PropsType = {
    title?: string;
    children?: React.ReactNode;
	className?: string;
	variant?: 'destructive' | 'default';
}

export const BannerComponent = ({ title, children, className, variant = 'destructive' }: PropsType) => (
	<Alert
		variant={variant}
		className={cn('w-full', className)}
	>
		{variant === 'destructive' ? <AlertCircleIcon /> : <InfoIcon />}
		<AlertTitle>{title}</AlertTitle>
		<AlertDescription>
			{children}
		</AlertDescription>
	</Alert>
);
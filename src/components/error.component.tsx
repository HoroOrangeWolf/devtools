import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertCircleIcon } from 'lucide-react';

type PropsType = {
    title?: string;
    children?: React.ReactNode;
}

export const ErrorBanner = ({ title, children }: PropsType) => (
	<Alert
		variant="destructive"
		className="w-full"
	>
		<AlertCircleIcon />
		<AlertTitle>{title}</AlertTitle>
		<AlertDescription>
			{children}
		</AlertDescription>
	</Alert>
);
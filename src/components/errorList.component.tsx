import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils.ts';

export type ErrorModel = {
    error: string;
}

type PropsType = {
    errors: ErrorModel[];
}

export const ErrorList = ({ errors }: PropsType) => {
	if (errors.length === 0) {
		return null;
	}

	return (
		<div className={cn('grid w-full gap-2 max-h-64 overflow-y-auto')}>
			{
				errors.map((error, index) => (
					<Alert
						key={`error-${index}-${error.error}`}
						variant="destructive"
						className="w-full"
					>
						<AlertCircleIcon />
						<AlertTitle>Failed to parse</AlertTitle>
						<AlertDescription>
							{error.error}
						</AlertDescription>
					</Alert>
				))
			}
		</div>
	);
};

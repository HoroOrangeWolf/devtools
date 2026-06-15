import { cn } from '@/lib/utils.ts';
import { ErrorBanner } from '@/components/error.component.tsx';

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
					<ErrorBanner
						key={`error-${index}-${error.error}`}
						title="Failed to parse"
					>
						{error.error}
					</ErrorBanner>
				))
			}
		</div>
	);
};

import { useMemo } from 'react';
import cronstrue from 'cronstrue';

type PropsType = {
    cron: string;
    isQuartz?: boolean;
}

export const CronViewComponent = ({ cron, isQuartz }: PropsType) => {
	const description = useMemo(() => {
		try {
			return cronstrue.toString(cron, {
				use24HourTimeFormat: true,
				dayOfWeekStartIndexZero: !isQuartz
			});
		} catch (error) {
			console.error('Failed to parse cron', error);
			return 'Invalid cron';
		}
	}, [cron, isQuartz]);
	const isValid = description !== 'Invalid cron';

	return (
		<div
			className="overflow-hidden rounded-xl border bg-card shadow-sm"
			aria-live="polite"
		>
			<div className="space-y-4 px-4 py-5 sm:px-5">
				<code className="block overflow-x-auto rounded-lg border bg-muted/50 px-4 py-3 text-center font-mono text-2xl font-semibold tracking-wide text-foreground sm:text-3xl">
					{cron}
				</code>

				<div>
					<p className="mb-1 text-sm font-medium text-muted-foreground">Cron description</p>
					<p className={isValid ? 'text-lg font-medium leading-relaxed sm:text-xl' : 'text-lg font-medium text-destructive sm:text-xl'}>
						{description}
					</p>
				</div>
			</div>
		</div>
	);
};

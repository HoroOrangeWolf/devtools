import { useMemo } from 'react';
import cronstrue from 'cronstrue';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils.ts';
import { ToastUtils } from '@/utils/toast.utils.ts';
import { ClipboardCopy } from 'lucide-react';

type PropsType = {
    cron: string;
    isQuartz?: boolean;
	onChange?: (value: string) => void;
}

const UNIX_EXPECTED_FRAGMENTS = 5;
const QUARTZ_EXPECTED_FRAGMENTS = 7;

export const CronInput = ({ cron, isQuartz, onChange }: PropsType) => {
	const expectedSize: number = isQuartz ? QUARTZ_EXPECTED_FRAGMENTS : UNIX_EXPECTED_FRAGMENTS;

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

	const fragments = useMemo(() => {
		const cronFragment = cron.split(' ', expectedSize);

		if (cronFragment.length === expectedSize) {
			return cronFragment;
		} else if (cronFragment.length > expectedSize) {
			return cronFragment.slice(0, expectedSize);
		}

		const difference = expectedSize - cronFragment.length;

		const toAdd = Array.from({ length: difference }, () => '*');

		return [...cronFragment, ...toAdd];
	}, [cron, expectedSize]);

	const isValid = description !== 'Invalid cron';

	const emitChangeEvent = (value: string, index: number) => {
		const buffFragments = [...fragments];

		buffFragments[index] = value;

		const rawCron = buffFragments.join(' ');

		onChange?.(rawCron);
	};

	const copyCron = async () => {
		try {
			await navigator.clipboard.writeText(cron);
			ToastUtils.info('Cron trigger has been copied to clipboard');
		} catch (error) {
			console.error('Failed to copy cron trigger to clipboard', error);
			ToastUtils.error('Could not copy cron trigger');
		}
	};

	const buildFragments = () => {
		return fragments.map((fragment, index) => (
			<Input
				aria-label={`Cron fragment ${index + 1} of ${expectedSize}`}
				className="block overflow-x-auto rounded-lg border bg-muted/50 p-2 text-center font-mono text-2xl font-semibold tracking-wide text-foreground sm:text-3xl min-w-0"
				key={index}
				value={fragment}
				onChange={(e) => emitChangeEvent(e.target.value, index)}
			/>
		));
	};

	return (
		<div
			className="overflow-hidden rounded-xl border bg-card shadow-sm"
			aria-live="polite"
		>
			<div className="space-y-4 px-4 py-5 sm:px-5">
				<div className="flex flex-col gap-2">
					<div className="flex flex-row justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={copyCron}
						>
							<ClipboardCopy />
							Copy trigger
						</Button>
					</div>
					<p className="text-sm font-medium text-muted-foreground">Cron trigger</p>
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						<div className={cn('grid min-w-0 flex-1 gap-2', isQuartz ? 'grid-cols-7' : 'grid-cols-5')}>
							{buildFragments()}
						</div>
					</div>
				</div>
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

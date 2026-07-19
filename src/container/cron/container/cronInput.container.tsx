import { useMemo } from 'react';
import cronstrue from 'cronstrue';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';

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

	const buildFragments = () => {
		return fragments.map((fragment, index) => (
			<Input
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
				<div className="w-full flex flex-row justify-center items-center">
					<div className={cn('grid gap-2', isQuartz ? 'grid-cols-7' : 'grid-cols-5')}>
						{buildFragments()}
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

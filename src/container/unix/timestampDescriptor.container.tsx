import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { TooltipWrapper } from '@/components/tooltipWrapper.component.tsx';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { ComboboxOption, ComboboxWrapper } from '@/components/comboboxWrapper.component.tsx';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const timezones = (Intl.supportedValuesOf('timeZone') as string[]).toSorted();

type PropsType = {
    timestamp: number;
}

export const TimestampDescriptorContainer = ({ timestamp }: PropsType) => {
	const [timezone, setTimezone] = useState('UTC');
	const timezoneOptions = useMemo<ComboboxOption[]>(
		() => timezones.map((value) => ({ label: value, value })),
		[],
	);

	useEffect(() => {
		const localTimezone = dayjs.tz.guess();

		if (timezones.includes(localTimezone)) {
			setTimezone(localTimezone);
		}
	}, []);

	const formattedUtc = dayjs(timestamp).utc().format(dateFormat);
	const formattedDateInZone = dayjs(timestamp).tz(timezone).format(dateFormat);

	return (
		<div className="flex flex-col gap-2">
			<Field>
				<FieldLabel htmlFor="timezone">Timezone</FieldLabel>
				<FieldContent>
					<ComboboxWrapper
						id="timezone"
						ariaLabel="Timezone"
						options={timezoneOptions}
						value={timezone}
						onChange={(e) => setTimezone(e.value)}
					/>
				</FieldContent>
			</Field>
			<div>
				UTC{' '}
				<TooltipWrapper tooltip={dateFormat}>
					<span className="cursor-help underline decoration-dotted underline-offset-4">{formattedUtc}</span>
				</TooltipWrapper>
			</div>
			<div>
				{timezone}{' '}
				<TooltipWrapper tooltip={dateFormat}>
					<span className="cursor-help underline decoration-dotted underline-offset-4">{formattedDateInZone}</span>
				</TooltipWrapper>
			</div>
		</div>
	);
};

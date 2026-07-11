import { useEffect, useMemo, useState } from 'react';
import { ComboboxOption, ComboboxWrapper } from '@/components/comboboxWrapper.component.tsx';
import dayjs from 'dayjs';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';

const timezones = (Intl.supportedValuesOf('timeZone') as string[]).toSorted();

type PropsType = {
    onChange?: (value: string) => void;
}

export const TimezoneSelect = ({ onChange }: PropsType) => {
	const [timezone, setTimezone] = useState<string>('UTC');

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

	useEffect(() => {
		onChange?.(timezone);
	}, [timezone]);

	return (
		<Field>
			<FieldLabel htmlFor="timezone">Timezone</FieldLabel>
			<FieldContent>
				<ComboboxWrapper
					id="timezone"
					ariaLabel="Timezone"
					options={timezoneOptions}
					value={timezone}
					onChange={(e) => {
						setTimezone(e.value);
					}}
				/>
			</FieldContent>
		</Field>
	);
};
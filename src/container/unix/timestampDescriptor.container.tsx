import { TooltipWrapper } from '@/components/tooltipWrapper.component.tsx';
import dayjs from 'dayjs';
import { useState } from 'react';
import { TimezoneSelect } from '@/container/unix/components/timezoneSelect.component.tsx';

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

type PropsType = {
    timestamp: number;
}

export const TimestampDescriptorContainer = ({ timestamp }: PropsType) => {
	const [timezone, setTimezone] = useState('UTC');

	const formattedUtc = dayjs(timestamp).utc().format(dateFormat);
	const formattedDateInZone = dayjs(timestamp).tz(timezone).format(dateFormat);

	// TODO: Poprawić to under line decoration.
	return (
		<div className="flex flex-col gap-2">
			<TimezoneSelect onChange={setTimezone} />
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

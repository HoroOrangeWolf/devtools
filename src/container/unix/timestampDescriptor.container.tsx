import { TooltipWrapper } from '@/components/tooltipWrapper.component.tsx';
import dayjs from 'dayjs';
import { useState } from 'react';
import { TimezoneSelect } from '@/container/unix/components/timezoneSelect.component.tsx';

const dateFormat = 'DD/MMM/YYYY HH:mm:ss';

type PropsType = {
    timestamp: number;
	isTimestampMode?: false
} | {
	isTimestampMode: true;
	date?: Date;
}

export const TimestampDescriptorContainer = (props: PropsType) => {
	const [timezone, setTimezone] = useState('UTC');

	const formatDate = (useTimezone: boolean) => {
		try {
			if (props.isTimestampMode) {
				return useTimezone ? dayjs(props.date).tz(timezone).toDate().getTime() : dayjs(props.date).tz('UTC', true).valueOf();
			}

			return useTimezone ? dayjs(props.timestamp).tz(timezone).format(dateFormat) : dayjs(props.timestamp).utc().format(dateFormat);
		} catch (error) {
			console.error(`Failed to parse date=${props.isTimestampMode ? props.date : props.timestamp} format`, error);
			return 'Invalid date';
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<TimezoneSelect onChange={setTimezone} />
			<div>
				{timezone}:&nbsp;
				<TooltipWrapper tooltip={props.isTimestampMode ? 'Timestamp' : dateFormat}>
					<span className="cursor-help font-bold">{formatDate(true)}</span>
				</TooltipWrapper>
			</div>
			<div>
				UTC:&nbsp;
				<TooltipWrapper tooltip={props.isTimestampMode ? 'Timestamp' : dateFormat}>
					<span className="cursor-help font-bold">{formatDate(false)}</span>
				</TooltipWrapper>
			</div>
		</div>
	);
};

import { TooltipWrapper } from '@/components/tooltipWrapper.component.tsx';
import dayjs from 'dayjs';
import { useState } from 'react';
import { TimezoneSelect } from '@/container/unix/components/timezoneSelect.component.tsx';
import { ClipboardWrapper } from '@/components/clipboardWrapper.component.tsx';

const dateFormat = 'DD/MMM/YYYY HH:mm:ss';

type PropsType = {
    timestamp: number;
	isTimestampMode?: false
} | {
	isTimestampMode: true;
	date?: Date;
}

export const TimestampDescriptorContainer = (props: PropsType) => {
	const [timezone, setTimezone] = useState<string>('UTC');

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

	const dateWithTimezone = formatDate(true);
	const dateWithoutTimezone = formatDate(false);

	return (
		<div className="flex flex-col gap-2">
			<TimezoneSelect onChange={setTimezone} />
			<div>
				{timezone}:&nbsp;
				<ClipboardWrapper text={dateWithTimezone}>
					<TooltipWrapper tooltip={props.isTimestampMode ? 'Timestamp' : dateFormat}>
						<span className="cursor-help font-bold">{dateWithTimezone}</span>
					</TooltipWrapper>
				</ClipboardWrapper>
			</div>
			<div>
				UTC:&nbsp;
				<ClipboardWrapper text={dateWithoutTimezone}>
					<TooltipWrapper tooltip={props.isTimestampMode ? 'Timestamp' : dateFormat}>
						<span className="cursor-help font-bold">{dateWithoutTimezone}</span>
					</TooltipWrapper>
				</ClipboardWrapper>
			</div>
		</div>
	);
};

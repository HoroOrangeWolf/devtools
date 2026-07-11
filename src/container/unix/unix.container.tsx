import { TimestampToDateContainer } from '@/container/unix/timestampToDate.container.tsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateToTimestampContainer } from '@/container/unix/dateToTimestamp.container.tsx';

dayjs.extend(utc);
dayjs.extend(timezone);

export const UnixContainer = () => {
	return (
		<div className="grid grid-cols-2 grid-rows-[repeat(fit-content, minmax(10rem, 1fr))] gap-2">
			<TimestampToDateContainer />
			<DateToTimestampContainer />
		</div>
	);
};
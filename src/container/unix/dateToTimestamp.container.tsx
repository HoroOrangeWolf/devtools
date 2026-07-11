import { DateTimePicker } from '@/components/dateTimepicker.component.tsx';
import { useState } from 'react';
import { TimestampDescriptorContainer } from '@/container/unix/timestampDescriptor.container.tsx';

export const DateToTimestampContainer = () => {
	const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

	return (
		<>
			<DateTimePicker
				label="Date"
				onChange={setCurrentDate}
				date={currentDate}
			/>
			<TimestampDescriptorContainer
				isTimestampMode={true}
				date={currentDate}
			/>
		</>
	);
};
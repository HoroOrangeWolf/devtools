import { DateTimePicker } from '@/components/dateTimepicker.component.tsx';
import { useEffect, useState } from 'react';
import { TimestampDescriptorContainer } from '@/container/unix/timestampDescriptor.container.tsx';

export const DateToTimestampContainer = () => {
	const [currentDate, setCurrentDate] = useState<Date>(() => new Date(0));

	useEffect(() => {
		setCurrentDate(new Date());
	}, []);

	return (
		<div className="flex flex-col gap-2">
			<DateTimePicker
				label="Date"
				onChange={setCurrentDate}
				date={currentDate}
			/>
			<TimestampDescriptorContainer
				isTimestampMode={true}
				date={currentDate}
			/>
		</div>
	);
};

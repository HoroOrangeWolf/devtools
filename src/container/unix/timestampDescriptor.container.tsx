import dayjs from 'dayjs';

type PropsType = {
    timestamp: number;
}

export const TimestampDescriptorContainer = ({ timestamp }: PropsType) => {
	const formatted = dayjs(timestamp).toISOString();
	const formattedDateInZone = dayjs(timestamp).tz('Europe/London', true).toISOString();

	return (
		<div className="flex flex-col gap-2">
			<div>
				UTC {formatted}
			</div>
			<div>
				Locale	{formattedDateInZone}
			</div>
		</div>
	);
};
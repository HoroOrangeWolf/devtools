import { Input } from '@/components/ui/input.tsx';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field.tsx';
import { TimestampDescriptorContainer } from '@/container/unix/timestampDescriptor.container.tsx';
import { useEffect, useState } from 'react';

export const TimestampToDateContainer = () => {
	const [timestamp, setTimestamp] = useState<number>(0);

	useEffect(() => {
		setTimestamp(Date.now());
	}, []);

	return (
		<>
			<div>
				<Field>
					<FieldLabel htmlFor="timestamp_val">UNIX Timestamp</FieldLabel>
					<FieldContent>
						<Input
							id="timestamp_val"
							value={timestamp}
							type="number"
							min={0}
							onChange={(e) => {
								setTimestamp(Number(e.target.value));
							}}
						/>
					</FieldContent>
				</Field>
			</div>
			<TimestampDescriptorContainer timestamp={timestamp} />
		</>
	);
};

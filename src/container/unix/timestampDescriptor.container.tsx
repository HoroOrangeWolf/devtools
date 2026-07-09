
type PropsType = {
    timestamp: number;
}

export const TimestampDescriptorContainer = ({ timestamp }: PropsType) => {
	return (
		<div>
			Rest {timestamp}
		</div>
	);
};
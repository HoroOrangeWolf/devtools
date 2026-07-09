import { TimestampToDateContainer } from '@/container/unix/timestampToDate.container.tsx';

export const UnixContainer = () => {
	return (
		<div className="grid grid-cols-2 grid-rows-[repeat(fit-content, minmax(10rem, 1fr))]">
			<TimestampToDateContainer />
		</div>
	);
};
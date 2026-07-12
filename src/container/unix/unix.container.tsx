import { TimestampToDateContainer } from '@/container/unix/timestampToDate.container.tsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { DateToTimestampContainer } from '@/container/unix/dateToTimestamp.container.tsx';
import { CalendarClock, Clock3 } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

export const UnixContainer = () => {
	return (
		<div className="grid gap-4 xl:grid-cols-2">
			<section className="rounded-xl border bg-card p-5 shadow-sm">
				<div className="mb-5 flex items-start gap-3 border-b pb-4">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<CalendarClock className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h2 className="font-semibold">Unix → Date</h2>
						<p className="text-sm text-muted-foreground">
							Convert a Unix timestamp into a readable date and time.
						</p>
					</div>
				</div>
				<TimestampToDateContainer />
			</section>

			<section className="rounded-xl border bg-card p-5 shadow-sm">
				<div className="mb-5 flex items-start gap-3 border-b pb-4">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Clock3 className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h2 className="font-semibold">Date → Unix</h2>
						<p className="text-sm text-muted-foreground">
							Choose a date to get its corresponding Unix timestamp.
						</p>
					</div>
				</div>
				<DateToTimestampContainer />
			</section>
		</div>
	);
};

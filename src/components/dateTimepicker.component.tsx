import React, { ChangeEvent, useState } from 'react';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Calendar } from '@/components/ui/calendar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ChevronDownIcon } from 'lucide-react';
import dayjs from 'dayjs';
import { Input } from '@/components/ui/input.tsx';
import { ButtonGroup } from '@/components/ui/button-group.tsx';

type PropsType = {
    date?: Date;
	label?: React.ReactNode;
	id?: string;
    onChange?: (date: Date) => void;
}

export const DateTimePicker = ({ date, onChange, id, label }: PropsType) => {
	const [currentDate, setCurrentDate] = useState<Date | undefined>(date);
	const [open, setOpen] = useState(false);

	const pickerDate = date ?? currentDate;

	const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
		const [hour = 12, minute = 0, second = 0] = event.target.value.split(':')
			.map(Number);

		const targetDate = dayjs(pickerDate ?? new Date())
			.hour(hour)
			.minute(minute)
			.second(second)
			.toDate();

		setCurrentDate(targetDate);
		onChange?.(targetDate);
	};

	return (
		<Field>
			<FieldLabel htmlFor={id}>{label}</FieldLabel>
			<ButtonGroup className="grid grid-cols-[3fr_minmax(9rem,1fr)]">
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild={true}>
						<Button variant="outline" id={id} className="w-full justify-between font-normal">
							{pickerDate ? dayjs(pickerDate).format('DD/MMM/YYYY') : 'Select date'}
							<ChevronDownIcon data-icon="inline-end" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto overflow-hidden p-0" align="start">
						<Calendar
							mode="single"
							selected={pickerDate}
							captionLayout="dropdown"
							defaultMonth={pickerDate}
							onSelect={(changeDate) => {
								setCurrentDate(changeDate);
								if (onChange && changeDate) {
									onChange(changeDate);
								}
								setOpen(false);
							}}
						/>
					</PopoverContent>
				</Popover>
				<Input
					type="time"
					id={id && `${id}-time`}
					step="1"
					onChange={handleTimeChange}
					defaultValue="10:30:00"
					className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</ButtonGroup>
		</Field>
	);
};
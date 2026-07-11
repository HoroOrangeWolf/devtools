import React, { ChangeEvent, useMemo, useState } from 'react';
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
	const [hour, setHour] = useState<number>(10);
	const [minute, setMinute] = useState<number>(30);
	const [second, setSecond] = useState<number>(0);
	const [open, setOpen] = useState(false);

	const pickerDate = date ?? currentDate;

	const timeDate = useMemo(()=>{
		try {
			if (!pickerDate){
				return `${hour}:${minute}:${second}`;
			}

			const dateParsed = dayjs(pickerDate).tz('UTC', true);

			setHour(dateParsed.hour());
			setMinute(dateParsed.minute());
			setSecond(dateParsed.second());

			return dateParsed.format('HH:mm:ss');
		}catch(error){
			console.error('Failed to get date date', error);
			return `${hour}:${minute}:${second}`;
		}
	},[pickerDate]);

	const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
		const [hour = 12, minute = 0, second = 0] = event.target.value.split(':')
			.map(Number);

		setHour(hour);
		setMinute(minute);
		setSecond(second);

		const targetDate = dayjs(pickerDate ?? new Date())
			.hour(hour)
			.minute(minute)
			.second(second)
			.toDate();

		setCurrentDate(targetDate);
		onChange?.(targetDate);
	};

	const handleDateChange = (date?: Date) => {
		if (!date) {
			return;
		}

		const properDate = dayjs(date)
			.hour(hour)
			.minute(minute)
			.second(second)
			.toDate();

		setCurrentDate(properDate);
		onChange?.(properDate);
		setOpen(false);
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
							onSelect={handleDateChange}
						/>
					</PopoverContent>
				</Popover>
				<Input
					type="time"
					id={id && `${id}-time`}
					step="1"
					onChange={handleTimeChange}
					value={timeDate}
					className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</ButtonGroup>
		</Field>
	);
};
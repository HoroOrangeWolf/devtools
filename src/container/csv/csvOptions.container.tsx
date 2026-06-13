import { useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { Input } from '@/components/ui/input.tsx';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';

const skipMode: OptionType<'greedy' | boolean>[] = [
	{
		label: 'False',
		value: false,
	},
	{
		label: 'Greedy',
		value: 'greedy',
		tooltip: 'Skips also lines with whitespaces',
	},
	{
		label: 'True',
		value: true,
	}
];

type NewLineOptionType = '\r' | '\n' | '\r\n'

const newLineOptions: OptionType<NewLineOptionType | undefined>[] = [
	{
		label: 'Auto',
		value: undefined,
	},
	{
		label: String.raw`\r`,
		value: '\r',
	},
	{
		label: String.raw`\n`,
		value: '\n',
	},
	{
		label: String.raw`\r\n`,
		value: '\r\n',
	}
];

export const CsvOptionsContainer = () => {
	const [delimeter, setDelimeter] = useState<string>();
	const [quote, setQuote] = useState<boolean>();
	const [skipEmptyLines, setSkipEmptyLines] = useState<boolean>();

	return (
		<div className={cn('mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-16 gap-y-4')}>
			<div className={cn('flex flex-col gap-4')}>
				<Field orientation="horizontal">
					<Checkbox id="quote" />
					<FieldContent>
						<FieldLabel htmlFor="quote">
							Quote
						</FieldLabel>
						<FieldDescription>
							Determines if CSV cells will be wrapped by quotes
						</FieldDescription>
					</FieldContent>
				</Field>
				<Field>
					<FieldLabel htmlFor="quoteChar">
						Quote Char
					</FieldLabel>
					<Input disabled={quote === undefined} id="quoteChar" defaultValue='"' />
					<FieldDescription>
						If quote is checked, you can use this option to pick your own quote char
					</FieldDescription>
				</Field>
				<Field>
					<FieldLabel htmlFor="delimiter">
						Delimiter
					</FieldLabel>
					<Input id="delimiter" defaultValue="" />
				</Field>
			</div>
			<div className={cn('flex flex-col gap-4')}>
				<Field orientation="horizontal">
					<Checkbox id="header" checked={true} />
					<FieldContent>
						<FieldLabel htmlFor="header">
							Header
						</FieldLabel>
						<FieldDescription>
							If false, it will remove header from csv.
						</FieldDescription>
					</FieldContent>
				</Field>
				<Field >
					<FieldLabel htmlFor="newLine">
						The new line sequence
					</FieldLabel>
					<SelectWrapper
						id="newLine"
						options={newLineOptions}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="skip">
						Skip empty lines
					</FieldLabel>
					<SelectWrapper
						id="skip"
						defaultValue={false}
						options={skipMode}
					/>
					<FieldDescription>
						Determines how empty lines should be handled while parsing CSV.
					</FieldDescription>
				</Field>
			</div>
		</div>
	);
};

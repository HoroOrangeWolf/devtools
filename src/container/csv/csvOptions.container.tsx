import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils.ts';
import { Input } from '@/components/ui/input.tsx';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { UnparseConfig } from 'papaparse';

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

type NewlineOptionType = '\r' | '\n' | '\r\n'

const newlineOptions: OptionType<NewlineOptionType | undefined>[] = [
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

type PropsType = {
	onSettingsChange: (options: UnparseConfig) => void;
}

export const CsvOptionsContainer = ({ onSettingsChange }: PropsType) => {
	const [delimiter, setDelimiter] = useState<string>(',');
	const [quote, setQuote] = useState<boolean>(false);
	const [skipEmptyLines, setSkipEmptyLines] = useState<boolean | 'greedy'>(false);
	const [quoteChar, setQuoteChar] = useState<string>('"');
	const [newlineSequence, setNewlineSequence] = useState<NewlineOptionType>('\r\n');

	useEffect(()=>{
		onSettingsChange({
			delimiter,
			skipEmptyLines,
			quotes: quote,
			quoteChar: quote ? quoteChar : undefined,
			newline: newlineSequence
		});
	},[delimiter, quote, skipEmptyLines, quoteChar, newlineSequence, onSettingsChange]);

	return (
		<div className={cn('mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-16 gap-y-4')}>
			<div className={cn('flex flex-col gap-4')}>
				<Field>
					<FieldLabel htmlFor="delimiter">
						Delimiter
					</FieldLabel>
					<Input id="delimiter" defaultValue={delimiter} onChange={(e)=>setDelimiter(e.target.value)} />
				</Field>
				<Field>
					<FieldLabel htmlFor="quoteChar">
						Quote Char
					</FieldLabel>
					<Input disabled={!quote} id="quoteChar" defaultValue={quoteChar} onChange={(e)=>setQuoteChar(e.target.value)}  />
					<FieldDescription>
						If quote is checked, you can use this option to pick your own quote char
					</FieldDescription>
				</Field>
				<Field orientation="horizontal">
					<Checkbox id="quote" checked={quote} onCheckedChange={(e)=>setQuote(Boolean(e))} />
					<FieldContent>
						<FieldLabel htmlFor="quote">
							Quote
						</FieldLabel>
						<FieldDescription>
							Determines if CSV cells will be wrapped by quotes
						</FieldDescription>
					</FieldContent>
				</Field>
			</div>
			<div className={cn('flex flex-col gap-4')}>
				<Field >
					<FieldLabel htmlFor="newLine">
						The new line sequence
					</FieldLabel>
					<SelectWrapper
						id="newLine"
						defaultValue={newlineSequence}
						onChange={(e)=> e && setNewlineSequence(e)}
						options={newlineOptions}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="skip">
						Skip empty lines
					</FieldLabel>
					<SelectWrapper
						id="skip"
						defaultValue={skipEmptyLines}
						onChange={(e)=> e && setSkipEmptyLines(e)}
						options={skipMode}
					/>
					<FieldDescription>
						Determines how empty lines should be handled while creating CSV
					</FieldDescription>
				</Field>
			</div>
		</div>
	);
};

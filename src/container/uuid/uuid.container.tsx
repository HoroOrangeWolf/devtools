import { useEffect, useState } from 'react';
import { GeneratorType, UuidService } from '@/service/uuid.service.ts';
import { cn } from '@/lib/utils.ts';
import { OptionType, SelectWrapper } from '@/components/selectWrapper.component.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button';
import { CsvService } from '@/service/csv.service.ts';

const generators: OptionType<GeneratorType>[] = [
	{
		label: 'V1',
		value: 'V_1'
	},
	{
		label: 'V4',
		value: 'V_4'
	},
	{
		label: 'V6',
		value: 'V_6'
	},
	{
		label: 'V7',
		value: 'V_7'
	}
];

const defaultGeneratorType: GeneratorType = 'V_4';
const defaultCount = 1;

export const UuidContainer = () => {
	const [generatedValues, setGeneratedValues] = useState<string[]>([]);
	const [generatorType, setGeneratorType] = useState<GeneratorType>(defaultGeneratorType);
	const [count, setCount] = useState<number>(defaultCount);

	useEffect(() => {
		setGeneratedValues(UuidService.generateValues(defaultGeneratorType, defaultCount));
	}, []);

	const generateValues = () => {
		const values = UuidService.generateValues(generatorType, count);

		setGeneratedValues(values);
	};

	const generateCSV = () => {
		const entries = generatedValues.map((val)=>({
			uuid: val
		}));

		CsvService.downloadCSV('generated_values.csv', entries);
	};

	return (
		<div className={cn('flex','flex-col', 'gap-2', 'max-h-[64dvh]')}>
			<div className={cn('grid', 'grid-cols-2', 'gap-2')}>
				<SelectWrapper<GeneratorType>
					ariaLabel="UUID version"
					defaultValue={generatorType}
					onChange={setGeneratorType}
					options={generators}
					placeholder="Select Generator..."
				/>
				<Input
					aria-label="Generate Values Count"
					type="number"
					onChange={(event) => {
						setCount(Number(event.target.value));
					}}
					defaultValue={defaultCount}
				/>
			</div>
			<div className={cn('flex','flex-row', 'gap-2', 'justify-end')}>
				<Button onClick={generateValues}>
					Generate
				</Button>
				<Button  onClick={generateCSV}>
					Export
				</Button>
			</div>
			<ul
				className={cn('overflow-y-auto', 'divide-y', 'divide-border')}
				role="list"
			>
				{generatedValues.map((val, index)=>(
					<li key={val} className={cn('flex', 'gap-2', 'py-1')}>
						<span>{index + 1}.</span>
						{val}
					</li>
				))}
			</ul>
		</div>
	);
};

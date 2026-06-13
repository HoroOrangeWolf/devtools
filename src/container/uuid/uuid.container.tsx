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

export const UuidContainer = () => {
	const [generatedValues, setGeneratedValues] = useState<string[]>([]);
	const [generatorType, setGeneratorType] = useState<GeneratorType>('V_4');
	const [count, setCount] = useState<number>(1);

	const generateValues = () => {
		const values = UuidService.generateValues(generatorType, count);

		setGeneratedValues(values);
	};

	useEffect(()=>{
		generateValues();
	},[]);

	const generateCSV = () => {
		const entries = generatedValues.map((val)=>({
			uuid: val
		}));

		CsvService.downloadCSV('generated_values.csv', entries);
	};

	return (
		<div className={cn('flex','flex-col', 'gap-2')}>
			<div className={cn('grid', 'grid-cols-2', 'gap-2')}>
				<SelectWrapper<GeneratorType>
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
					defaultValue={1}
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
			<ul>
				{generatedValues.map((val)=>(
					<li key={val}>
						{val}
					</li>
				))}
			</ul>
		</div>
	);
};
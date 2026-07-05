import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const CostFactorComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel htmlFor="hash-cost-factor">Cost Factor</FieldLabel>
		<Input
			id="hash-cost-factor"
			min={4}
			max={31}
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Number of iterations to perform (4-31), over 15 may crash your browser.
		</FieldDescription>
	</Field>
);

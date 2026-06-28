import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const CostFactorComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel>Cost Factor</FieldLabel>
		<Input
			min={4}
			max={31}
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Number of iterations to perform (4-31)
		</FieldDescription>
	</Field>
);
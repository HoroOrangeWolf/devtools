import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const IterationComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel htmlFor="hash-iterations">Iterations</FieldLabel>
		<Input
			id="hash-iterations"
			min={1}
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Number of iterations to perform
		</FieldDescription>
	</Field>
);

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const HashLengthComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel htmlFor="hash-length">Hash Length</FieldLabel>
		<Input
			id="hash-length"
			type="number"
			min={1}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Output size in bytes
		</FieldDescription>
	</Field>
);

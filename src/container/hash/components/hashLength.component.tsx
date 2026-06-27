import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const HashLengthComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel>Hash Length</FieldLabel>
		<Input
			min={1}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
	</Field>
);
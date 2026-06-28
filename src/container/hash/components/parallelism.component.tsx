import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const ParallelismComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel>Parallelism</FieldLabel>
		<Input
			type="number"
			min={1}
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Determines amount of threads to calculate hash
		</FieldDescription>
	</Field>
);
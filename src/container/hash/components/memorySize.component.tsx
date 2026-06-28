import { Field, FieldDescription, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';

type PropsType = {
    value: number;
    onChange: (value: number) => void;
}

export const MemorySizeComponent = ({ value, onChange }: PropsType) => (
	<Field>
		<FieldLabel>Memory Size</FieldLabel>
		<Input
			min={1}
			type="number"
			value={value}
			onChange={(e) => onChange(Number(e.target.value))}
		/>
		<FieldDescription>
			Amount of memory to be used in KB&apos;s
		</FieldDescription>
	</Field>
);
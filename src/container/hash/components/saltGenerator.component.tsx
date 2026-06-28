import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import { RefreshCw } from 'lucide-react';
import { SaltUtils } from '@/container/hash/service/salt.utils.ts';
import { useState } from 'react';

type PropsType = {
    value: string;
    onChange: (value: string) => void;
}

const SALT_DEFAULT = 8;

export const SaltGeneratorComponent = ({ value, onChange }: PropsType) => {
	const [isLocked, setIsLocked] = useState<boolean>(false);

	const onRefresh = async () => {
		try {
			setIsLocked(true);
			onChange(SaltUtils.generateSalt(SALT_DEFAULT));
		} catch (error) {
			console.error('Failed to generate salt', error);
		} finally {
			setIsLocked(false);
		}
	};

	return (
		<Field>
			<FieldLabel>Salt</FieldLabel>
			<ButtonGroup>
				<Input
					disabled={isLocked}
					value={value}
					minLength={1}
					onChange={(e) => onChange(e.target.value)}
				/>
				<Button
					disabled={isLocked}
					variant="outline"
					onClick={onRefresh}
				>
					<RefreshCw />
				</Button>
			</ButtonGroup>
		</Field>
	);
};
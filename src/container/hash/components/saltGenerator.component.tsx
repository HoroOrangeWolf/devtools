import { HashOptionType, HashOptionTypeConstant } from '@/container/hash/constant/hashOptionType.constant.ts';
import { Field, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { Button } from '@/components/ui/button.tsx';
import { RefreshCw } from 'lucide-react';
import { SaltUtils } from '@/container/hash/service/salt.utils.ts';

type PropsType = {
    value: string;
    optionMode: HashOptionType;
    onChange: (value: string) => void;
}

const SALT_DEFAULT = 16;

export const SaltGeneratorComponent = ({ value, onChange, optionMode }: PropsType) => {
	const getMinVal = () => {
		switch (optionMode) {
			case HashOptionTypeConstant.ARGON: {
				return 8;
			}
			case HashOptionTypeConstant.BCRYPT: {
				return SALT_DEFAULT;
			}
		}
	};

	const getMaxVal = () => {
		switch (optionMode) {
			case HashOptionTypeConstant.ARGON: {
				return Number.MAX_VALUE;
			}
			case HashOptionTypeConstant.BCRYPT: {
				return SALT_DEFAULT;
			}
		}
	};

	const onRefresh = () => {
		onChange(SaltUtils.generateSalt(SALT_DEFAULT));
	};

	return (
		<Field>
			<FieldLabel>Salt</FieldLabel>
			<ButtonGroup>
				<Input
					value={value}
					minLength={getMinVal()}
					maxLength={getMaxVal()}
					onChange={(e) => onChange(e.target.value)}
				/>
				<Button
					variant="outline"
					onClick={onRefresh}
				>
					<RefreshCw />
				</Button>
			</ButtonGroup>
		</Field>
	);
};
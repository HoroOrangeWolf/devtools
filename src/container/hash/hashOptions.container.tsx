import { ExcludedArgon, ExcludedBcrypt, HashOptionTypes } from '@/container/hash/service/hash.service.ts';
import { useEffect, useState } from 'react';
import { HashLengthComponent } from '@/container/hash/components/hashLength.component.tsx';
import { IterationComponent } from '@/container/hash/components/iteration.component.tsx';
import { MemorySizeComponent } from '@/container/hash/components/memorySize.component.tsx';
import { ParallelismComponent } from '@/container/hash/components/parallelism.component.tsx';
import { CostFactorComponent } from '@/container/hash/components/costFactor.component.tsx';
import { SaltGeneratorComponent } from '@/container/hash/components/saltGenerator.component.tsx';
import { SaltUtils } from '@/container/hash/service/salt.utils.ts';
import { HashOptionTypeConstant } from '@/container/hash/constant/hashOptionType.constant.ts';

type PropsType = {
	isArgonSettings: boolean;
    onChange: (options: HashOptionTypes) => void;
}

const salt = SaltUtils.generateSalt(16);

const argonDef: ExcludedArgon = {
	hashLength: 16,
	iterations: 16,
	memorySize: 16,
	parallelism: 1,
	salt
};

const bcryptDef: ExcludedBcrypt = {
	salt,
	costFactor: 4
};

export const HashOptionsContainer = ({ onChange, isArgonSettings }: PropsType) => {
	const [argonOptions, setArgonOptions] = useState<ExcludedArgon>(argonDef);
	const [bcryptOptions, setBcryptOptions] = useState<ExcludedBcrypt>(bcryptDef);

	useEffect(() => {
		if (isArgonSettings) {
			onChange(argonOptions);
			return;
		}

		onChange(bcryptOptions);
	}, [argonOptions, bcryptOptions, isArgonSettings]);

	if (isArgonSettings) {
		return (
			<div className="flex-col gap-2">
				<HashLengthComponent
					value={argonOptions.hashLength}
					onChange={(e) => setArgonOptions({ ...argonOptions, hashLength: e })}
				/>
				<IterationComponent
					value={argonOptions.iterations}
					onChange={(e) => setArgonOptions({ ...argonOptions, iterations: e })}
				/>
				<MemorySizeComponent
					value={argonOptions.memorySize}
					onChange={(e) => setArgonOptions({ ...argonOptions, memorySize: e })}
				/>
				<ParallelismComponent
					value={argonOptions.parallelism}
					onChange={(e) => setArgonOptions({ ...argonOptions, parallelism: e })}
				/>
				<SaltGeneratorComponent
					value={argonOptions.salt as string}
					optionMode={HashOptionTypeConstant.ARGON}
					onChange={(e) => setArgonOptions({ ...argonOptions, salt: e })}
				/>
			</div>
		);
	}

	return (
		<div className="flex-col gap-2">
			<CostFactorComponent
				value={bcryptOptions.costFactor}
				onChange={(e) => setBcryptOptions({ ...bcryptOptions, costFactor: e })}
			/>
			<SaltGeneratorComponent
				value={bcryptOptions.salt as string}
				optionMode={HashOptionTypeConstant.BCRYPT}
				onChange={(e) => setBcryptOptions({ ...bcryptOptions, salt: e })}
			/>
		</div>
	);
};
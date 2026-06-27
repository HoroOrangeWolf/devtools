import { ExcludedArgon, HashOptionTypes } from '@/container/hash/service/hash.service.ts';
import { useState } from 'react';
import { HashLengthComponent } from '@/container/hash/components/hashLength.component.tsx';
import { IterationComponent } from '@/container/hash/components/iteration.component.tsx';
import { MemorySizeComponent } from '@/container/hash/components/memorySize.component.tsx';
import { ParallelismComponent } from '@/container/hash/components/parallelism.component.tsx';

type PropsType = {
    onChange: (options: HashOptionTypes) => void;
}

const argonDef: ExcludedArgon = {
	hashLength: 16,
	iterations: 16,
	memorySize: 16,
	parallelism: 1,
	salt: undefined 
};

export const HashOptionsContainer = ({ onChange }: PropsType) => {
	const [argonOptions, setArgonOptions] = useState<ExcludedArgon>(argonDef);

	return (
		<div>
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
		</div>
	);
};
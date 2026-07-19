import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { CronTypes, CronTypesConstant } from '@/container/cron/constant/cronTypes.constant.ts';
import { useState } from 'react';
import { CronBuilder } from '@/container/cron/container/cronBuilder.container.tsx';

type ButtonOptionType = OptionType<CronTypes>;

const options: ButtonOptionType[] = [
	{
		label: 'Unix Cron',
		value: CronTypesConstant.UNIX
	},
	{
		label: 'Quartz Cron',
		value: CronTypesConstant.QUARTZ
	}
];

export const CronContainer = () => {
	const [mode, setMode] = useState<CronTypes>(CronTypesConstant.UNIX);

	return (
		<div className="flex flex-col gap-2">
			<ButtonSelectWrapper
				onClick={setMode}
				value={mode}
				options={options}
			/>
			{mode === CronTypesConstant.QUARTZ && <CronBuilder isQuartz={true}  />}
			{mode === CronTypesConstant.UNIX && <CronBuilder isQuartz={false} />}
		</div>
	);
};
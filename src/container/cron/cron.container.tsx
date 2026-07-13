import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { CronTypes, CronTypesConstant } from '@/container/cron/constant/cronTypes.constant.ts';
import { useState } from 'react';
import { UnixCronContainer } from '@/container/cron/container/unixCron.container.tsx';
import { QuartzCronContainer } from '@/container/cron/container/quartzCron.container.tsx';

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
		<div>
			<ButtonSelectWrapper
				onClick={setMode}
				value={mode}
				options={options}
			/>
			{mode === CronTypesConstant.QUARTZ && <QuartzCronContainer />}
			{mode === CronTypesConstant.UNIX && <UnixCronContainer />}
		</div>
	);
};
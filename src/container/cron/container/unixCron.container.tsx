import { QuartzBuilderContainer } from '@/container/cron/container/quartzBuilder.container.tsx';
import { useState } from 'react';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';

const options = [
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY
].map((opt): OptionType<CronModeType> => ({
	label: opt,
	value: opt
}));

export const UnixCronContainer = () => {
	const [cronMode, setCronMode] = useState<CronModeType>(CronModeConstant.MINUTE);

	return (
		<div className="flex flex-col gap-2" >
			<ButtonSelectWrapper
				value={cronMode}
				options={options}
				onClick={setCronMode}
			/>
			<QuartzBuilderContainer
				key={cronMode}
				mode={cronMode}
			/>
		</div>
	);
};
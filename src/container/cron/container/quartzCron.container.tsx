import { QuartzBuilderContainer } from '@/container/cron/container/quartzBuilder.container.tsx';
import { useState } from 'react';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';

const options = [
	CronModeConstant.SECOND,
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY,
	CronModeConstant.YEAR,
].map((opt): OptionType<CronModeType> => ({
	label: opt,
	value: opt
}));

export const QuartzCronContainer = () => {
	const [cronMode, setCronMode] = useState<CronModeType>(CronModeConstant.MINUTE);

	return (
		<div className="flex flex-col gap-2">
			<ButtonSelectWrapper
				options={options}
				onClick={setCronMode}
			/>
			<QuartzBuilderContainer
				mode={cronMode}
				key={cronMode}
			/>
		</div>
	);
};
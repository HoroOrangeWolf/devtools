import { QuartzBuilderContainer, QuartzValueType } from '@/container/cron/container/quartzBuilder.container.tsx';
import { useMemo, useState } from 'react';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { CronViewComponent } from '@/container/cron/components/cronView.component.tsx';
import { CronBuilderService } from '@/container/cron/service/cronBuilder.service.ts';

const modes: CronModeType[] =  [
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY
];

const options = modes.map((opt): OptionType<CronModeType> => ({
	label: opt,
	value: opt
}));

const defaultState: QuartzValueType = {
	every: true,
};

export const UnixCronContainer = () => {
	const [cronMode, setCronMode] = useState<CronModeType>(CronModeConstant.MINUTE);
	const [buildState, setBuilderState] = 	useState<QuartzValueType[]>(() => Array.from({ length: modes.length }, ()=>defaultState));

	const currentIndex = modes.indexOf(cronMode);

	const currentStateValue = buildState[currentIndex];

	const onChange = (value: QuartzValueType) => {
		const buffState = [...buildState];

		buffState[currentIndex] = value;
		setBuilderState(buffState);
	};

	// TODO: dodać errory
	const cron =	useMemo(() => CronBuilderService.buildCron(buildState), [buildState]);

	return (
		<div className="flex flex-col gap-2" >
			<CronViewComponent cron={cron} />
			<ButtonSelectWrapper
				value={cronMode}
				options={options}
				onClick={setCronMode}
			/>
			<QuartzBuilderContainer
				key={cronMode}
				mode={cronMode}
				value={currentStateValue}
				onChange={onChange}
			/>
		</div>
	);
};
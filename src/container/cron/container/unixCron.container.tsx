import {
	QuartzBuilderContainer,
	QuartzValueType,
	QuartzValueWithModeType
} from '@/container/cron/container/quartzBuilder.container.tsx';
import { useEffect, useState } from 'react';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { CronInput } from '@/container/cron/container/cronInput.container.tsx';
import { CronBuilderService } from '@/container/cron/service/cronBuilder.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { CronParserService } from '@/container/cron/service/cronParser.service.ts';

const modes: CronModeType[] =  [
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY
];

const options = modes.map((opt): OptionType<CronModeType> => ({
	label: opt.replace('_', ' '),
	value: opt
}));

const defaultState: QuartzValueType = {
	every: true,
	isPositionBased: false,
};

export const UnixCronContainer = () => {
	const [cronMode, setCronMode] = useState<CronModeType>(CronModeConstant.MINUTE);
	const [cron, setCron] = useState<string>('* * * * * *');
	const [errorMessage, setErrorMessage] = useState<string>();
	const [buildState, setBuilderState] = 	useState<QuartzValueType[]>(() => Array.from({ length: modes.length }, ()=>defaultState));

	const currentIndex = modes.indexOf(cronMode);

	const currentStateValue = buildState[currentIndex];

	const onChange = (value: QuartzValueType) => {
		const buffState = [...buildState];

		buffState[currentIndex] = value;
		setBuilderState(buffState);
	};

	useEffect(() => {
		try {
			const withModes = modes.map((mode, index): QuartzValueWithModeType => ({
				mode,
				...buildState[index]
			}));

			const builtCron = CronBuilderService.buildCron(withModes);
			setCron(builtCron);
		} catch (error) {
			console.error('Failed to create cron', error);
			setErrorMessage('Failed to parse current build state');
		}
	}, [buildState]);

	const onInputChange = (cron: string) => {
		try {
			setErrorMessage(undefined);
			setCron(cron);
			const parsedCron =	CronParserService.parseCron(cron, false);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			setBuilderState(parsedCron.map(({ mode, ...fragment }): QuartzValueType => fragment));
		} catch(error) {
			console.error('Failed to parse cron', error);
			setErrorMessage(`Failed to parse cron, due to: ${(error as Error).message}`);
		}
	};
	
	return (
		<div className="flex flex-col gap-2" >
			<CronInput cron={cron} onChange={onInputChange} />
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
			<BannerComponent
				title="Error"
				className={errorMessage ? 'opacity-100' : 'opacity-0'}
			>
				{errorMessage}
			</BannerComponent>
		</div>
	);
};
import {
	QuartzFragmentContainer,
	QuartzValueType,
	QuartzValueWithModeType
} from '@/container/cron/container/quartzFragment.container.tsx';
import { useEffect, useMemo, useState } from 'react';
import { CronModeConstant, CronModeType } from '@/container/cron/constant/cronMode.constant.ts';
import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import { CronInput } from '@/container/cron/container/cronInput.container.tsx';
import { CronBuilderService } from '@/container/cron/service/cronBuilder.service.ts';
import { BannerComponent } from '@/components/banner.component.tsx';
import { CronParserService } from '@/container/cron/service/cronParser.service.ts';

const unixModes: CronModeType[] =  [
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY
];

const quartzModes: CronModeType[] = [
	CronModeConstant.SECOND,
	CronModeConstant.MINUTE,
	CronModeConstant.HOUR,
	CronModeConstant.DAY,
	CronModeConstant.MONTH,
	CronModeConstant.WEEK_DAY,
	CronModeConstant.YEAR,
] as const;

const defaultState: QuartzValueType = {
	every: true,
	isPositionBased: false,
};

type PropsType = {
	isQuartz: boolean;
}

const QUARTZ_DEFAULT = '* * * * * * *';
const UNIX_DEFAULT = '* * * * *';

export const CronBuilder = ({ isQuartz }: PropsType) => {
	const modes = isQuartz ? quartzModes : unixModes;

	const options =	useMemo(() => modes.map((opt): OptionType<CronModeType> => ({
		label: opt.replace('_', ' '),
		value: opt
	})),
	[modes]
	);

	const [cronMode, setCronMode] = useState<CronModeType>(CronModeConstant.MINUTE);
	const [cron, setCron] = useState<string>(isQuartz ? QUARTZ_DEFAULT : UNIX_DEFAULT);
	const [errorMessage, setErrorMessage] = useState<string>();
	const [buildState, setBuilderState] = 	useState<QuartzValueType[]>(() => Array.from({ length: options.length }, ()=>defaultState));

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

	const onInputChange = (cronValue: string) => {
		try {
			const newCron = cronValue.split(' ');
			const oldCron = cron.split(' ');

			for (const [index, element] of newCron.entries()) {
				if (element !== oldCron[index]) {
					setCronMode(options[index].value);
					break;
				}
			}

			setErrorMessage(undefined);
			setCron(cronValue);
			const parsedCron =	CronParserService.parseCron(cronValue, isQuartz);

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			setBuilderState(parsedCron.map(({ mode, ...fragment }): QuartzValueType => fragment));
		} catch(error) {
			console.error('Failed to parse cron', error);
			setErrorMessage(`Failed to parse cron, due to: ${(error as Error).message}`);
		}
	};
	
	return (
		<div className="flex flex-col gap-2" >
			<CronInput cron={cron} isQuartz={isQuartz} onChange={onInputChange} />
			<ButtonSelectWrapper
				value={cronMode}
				options={options}
				onClick={setCronMode}
			/>
			<QuartzFragmentContainer
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
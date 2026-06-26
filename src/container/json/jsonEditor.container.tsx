import { ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { ViewType, ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { JsonTreeSettings, JsonTreeView, JsonValue } from '@/container/json/view/jsonTreeView.component.tsx';
import { cn } from '@/lib/utils.ts';
import { CodeXml, LucideListTree, TextAlignStart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { OptionType } from '@/components/select/selectWrapper.component.tsx';
import {
	JsonPrettyViewModeConstant,
	JsonPrettyViewModeType
} from '@/container/json/constant/jsonPrettyViewMode.constant.ts';
import { FileService } from '@/service/file.service.ts';
import { FileDataTypeExtensionMapConstant } from '@/container/json/constant/fileDataTypeExtensionMap.constant.ts';
import { useDebounceValue } from '@/hooks/useDebounce.hook.ts';
import { CodeMirrorWrapper } from '@/container/json/view/codeMirrorWrapper.component.tsx';

type PropsType = {
	value?: string;
	onChange?: (change: string) => void;
	readOnly?: boolean;
	treeSettings?: JsonTreeSettings;
	onError?: (e: Error) => void;
	tabCount?: number;
	targetTransform?: ViewDataType;
	displayMode?: JsonPrettyViewModeType;
	className?: string;
}

const parseJson = (value: string) => {
	if (value.trim() === '') {
		return { errorMessage: 'JSON input cannot be empty.' };
	}

	try {
		return JSON.parse(value);
	} catch {
		return {};
	}
};

const SUPPORTED_MODES: Record<ViewDataType, ViewType[]> = {
	[ViewDataTypeConstant.JSON]: [
		ViewTypeConstant.RAW,
		ViewTypeConstant.CODE,
		ViewTypeConstant.TREE,
	],
	[ViewDataTypeConstant.CSV]: [
		ViewTypeConstant.RAW
	],
	[ViewDataTypeConstant.XML]: [
		ViewTypeConstant.CODE,
		ViewTypeConstant.RAW
	]
};

// TODO: Dalej ten problem z tym value.
export const JsonEditorContainer = ({
	value = '',
	onChange,
	readOnly = false,
	treeSettings,
	targetTransform = ViewDataTypeConstant.JSON,
	tabCount = 2,
	displayMode,
	onError,
	className,
}: PropsType) => {
	const [jsonViewType, setJsonViewType] = useState<ViewType>(ViewTypeConstant.CODE);
	const [targetValue, setTargetValue] = useState<string>(value);
	const [lastKnowValidJson, setLastKnowValidJson] = useState<string>(value);
	const lazyValue = useDebounceValue(value,250);
	const lazyTargetValue = useDebounceValue(targetValue,250);

	useEffect(() => {
		if (!lazyTargetValue) {
			return;
		}

		try {
			if (targetTransform === ViewDataTypeConstant.JSON) {
				JSON.parse(lazyTargetValue);
			} else {
				console.warn('Only JSON data type is supported.');
			}

			setLastKnowValidJson(lazyTargetValue);
			if (!readOnly) {
				onChange?.(lazyTargetValue);
			}
		} catch (error) {
			console.error('Failed to parse ignoring target value',error);
		}
	}, [lazyTargetValue, readOnly]);

	useEffect(() => {
		setTargetValue((val)=>{
			try {
				return FileService.transformJsonToTarget(JSON.parse(lazyValue), FileDataTypeExtensionMapConstant[targetTransform], {
					tabs: displayMode === JsonPrettyViewModeConstant.BEAUTIFIED ? tabCount : undefined
				});
			} catch (error) {
				console.error('Failed to parse json editor.', error);
				onError?.(error as Error);
				return val;
			}
		});
	}, [targetTransform, lazyValue, tabCount, displayMode]);

	const handleTextChange = (nextValue: string) => {
		setTargetValue(nextValue);
	};

	const handleTreeChange = (nextValue: JsonValue) => {
		const target = JSON.stringify(nextValue);
		setTargetValue(target);
	};

	const viewOptions = useMemo((): OptionType<ViewType>[] => {
		return [
			{
				label: <CodeXml aria-label="Code view" />,
				value: ViewTypeConstant.CODE,
			},
			{
				label: <TextAlignStart aria-label="Raw view" />,
				value: ViewTypeConstant.RAW,
			},
			{
				label: <LucideListTree aria-label="Tree view" />,
				value: ViewTypeConstant.TREE,
			},
		].map((opt) => ({
			...opt,
			tooltip: SUPPORTED_MODES[targetTransform].includes(opt.value) ? undefined : 'This data type is not supported by this view',
			isDisabled: !SUPPORTED_MODES[targetTransform].includes(opt.value)
 		}));
	}, [targetTransform]);

	useEffect(() => {
		if (!targetTransform || SUPPORTED_MODES[targetTransform].includes(jsonViewType)) {
			return;
		}

		setJsonViewType((curr) => SUPPORTED_MODES[targetTransform][0] ?? curr);
	}, [targetTransform]);

	const getView = () => {
		switch (jsonViewType) {
			case ViewTypeConstant.CODE: {
				return (
					<CodeMirrorWrapper
						className={className}
						value={lastKnowValidJson}
						onChange={handleTextChange}
						readOnly={readOnly}
						targetTransform={targetTransform}
					/>
				);
			}
			case ViewTypeConstant.RAW: {
				return (
					<Textarea
						className={className}
						value={targetValue}
						readOnly={readOnly}
						onChange={(event) => handleTextChange(event.target.value)}
					/>
				);
			}
			case ViewTypeConstant.TREE: {
				return (
					<JsonTreeView
						value={parseJson(targetValue)}
						readOnly={readOnly}
						settings={treeSettings}
						onChange={handleTreeChange}
					/>
				);
			}
		}
	};

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<div className="flex flex-row justify-start">
				<ButtonSelectWrapper
					options={viewOptions}
					value={jsonViewType}
					onClick={setJsonViewType}
				/>
			</div>
			{getView()}
		</div>
	);
};

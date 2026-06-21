import {  ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { ViewType, ViewTypeConstant } from '@/container/json/constant/viewType.constant.ts';
import { CodeView } from '@/container/json/view/codeView.component.tsx';
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

export const JsonEditorContainer = ({
	value = '',
	onChange,
	readOnly = false,
	treeSettings,
	targetTransform,
	tabCount = 2,
	displayMode,
	onError,
	className,
}: PropsType) => {
	const [jsonViewType, setJsonViewType] = useState<ViewType>(ViewTypeConstant.CODE);
	const [targetValue, setTargetValue] = useState<string>(value);
	const dataType = targetTransform ?? ViewDataTypeConstant.JSON;

	useEffect(() => {
		const fn = async () => {
			try {
				const result = FileService.transformJsonToTarget(parseJson(value), FileDataTypeExtensionMapConstant[dataType], {
					tabs: displayMode === JsonPrettyViewModeConstant.BEAUTIFIED ? tabCount : undefined
				});

				setTargetValue(result);
			} catch (error) {
				console.error('Failed to parse json editor.', error);
				onError?.(error as Error);
				throw error;
			}
		};

		fn()
			.catch(console.error);
	}, [dataType, value, tabCount, displayMode]);

	const handleTextChange = (nextValue: string) => {
		onChange?.(nextValue);
		setTargetValue(nextValue);
	};

	const handleTreeChange = (nextValue: JsonValue) => {
		const target = JSON.stringify(nextValue);

		onChange?.(target);
		setTargetValue(target);
	};

	const viewOptions = useMemo((): OptionType<ViewType>[] => {
		const supportedModes = new Set<ViewType>([
			ViewTypeConstant.RAW,
			ViewTypeConstant.CODE
		]);

		const isSupportedDataType = targetTransform && targetTransform !== ViewDataTypeConstant.JSON;

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
			tooltip: isSupportedDataType && !supportedModes.has(opt.value) ? 'This data type is only supported by the JSON' : undefined,
			isDisabled: isSupportedDataType && !supportedModes.has(opt.value)
 		}));
	}, [targetTransform]);

	useEffect(() => {
		if (!targetTransform || targetTransform === ViewDataTypeConstant.JSON) {
			return;
		}

		setJsonViewType((currentViewType) => currentViewType === ViewTypeConstant.TREE
			? ViewTypeConstant.CODE
			: currentViewType);
	}, [targetTransform]);

	const getView = () => {
		switch (jsonViewType) {
			case ViewTypeConstant.CODE: {
				return (
					<div className="flex flex-col gap-2">
						<CodeView
							type={dataType}
							value={targetValue}
							readOnly={readOnly}
							onChange={handleTextChange}
						/>
					</div>
				);
			}
			case ViewTypeConstant.RAW: {
				return (
					<div className="flex flex-col gap-2">
						<Textarea
							value={targetValue}
							readOnly={readOnly}
							onChange={(event) => handleTextChange(event.target.value)}
						/>
					</div>
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

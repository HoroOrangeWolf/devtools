import {  ButtonSelectWrapper } from '@/components/select/buttonSelectWrapper.component.tsx';
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
import ReactCodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

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

const jsonEditorTheme = EditorView.theme({
	'&': {
		height: '100%',
		overflow: 'hidden',
		border: '1px solid var(--border)',
		borderRadius: 'var(--radius-lg)',
		backgroundColor: 'var(--background)',
		color: 'var(--foreground)',
	},
	'&.cm-focused': {
		outline: 'none',
		boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring), transparent 50%)',
		borderColor: 'var(--ring)',
	},
	'.cm-scroller': {
		fontFamily: 'var(--font-mono)',
		fontSize: '0.75rem',
		lineHeight: '1.5rem',
	},
	'.cm-content': {
		padding: '0.5rem',
		caretColor: 'var(--ring)',
	},
	'.cm-line': {
		padding: '0 0.25rem',
	},
	'.cm-gutters': {
		backgroundColor: 'var(--background)',
		borderRight: '1px solid var(--border)',
		color: 'var(--muted-foreground)',
	},
	'.cm-activeLine, .cm-activeLineGutter': {
		backgroundColor: 'color-mix(in oklch, var(--muted), transparent 35%)',
	},
	'.cm-cursor': {
		borderLeftColor: 'var(--ring)',
	},
	'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
		backgroundColor: 'color-mix(in oklch, var(--primary), transparent 70%)',
	},
	'.cm-foldPlaceholder': {
		backgroundColor: 'var(--muted)',
		borderColor: 'var(--border)',
		color: 'var(--muted-foreground)',
	},
	'.cm-tooltip': {
		backgroundColor: 'var(--popover)',
		borderColor: 'var(--border)',
		color: 'var(--popover-foreground)',
	},
}, { dark: false });

const jsonEditorHighlightStyle = HighlightStyle.define([
	{ tag: tags.propertyName, color: 'light-dark(#0e7490, #67e8f9)' },
	{ tag: tags.tagName, color: 'light-dark(#0e7490, #67e8f9)' },
	{ tag: tags.attributeName, color: 'light-dark(#2563eb, #60a5fa)' },
	{ tag: tags.string, color: 'light-dark(#d97706, #fbbf24)' },
	{ tag: tags.number, color: 'light-dark(#2563eb, #60a5fa)' },
	{ tag: tags.bool, color: 'light-dark(#7c3aed, #a78bfa)' },
	{ tag: tags.null, color: 'var(--muted-foreground)' },
	{ tag: tags.comment, color: 'var(--muted-foreground)', fontStyle: 'italic' },
	{ tag: [tags.brace, tags.squareBracket, tags.separator, tags.angleBracket], color: 'var(--muted-foreground)' },
]);

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

	// TODO: Move to another component
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
					<ReactCodeMirror
						className={className}
						value={lastKnowValidJson}
						theme={jsonEditorTheme}
						onChange={(e) => handleTextChange(e)}
						readOnly={readOnly}
						extensions={[
							targetTransform === ViewDataTypeConstant.JSON ? json() : xml(),
							syntaxHighlighting(jsonEditorHighlightStyle),
						]}
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

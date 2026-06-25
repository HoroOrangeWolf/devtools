import ReactCodeMirror from '@uiw/react-codemirror';
import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

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


type PropsType = {
    className?: string;
    value?: string;
    readOnly?: boolean;
    onChange?: (value: string) => void;
    targetTransform?: ViewDataType;
}

export const CodeMirrorWrapper = ({
	className,
	value,
	readOnly,
	onChange,
	targetTransform = ViewDataTypeConstant.JSON
}: PropsType) => {
	return (
		<ReactCodeMirror
			className={className}
			value={value}
			theme={jsonEditorTheme}
			onChange={onChange}
			readOnly={readOnly}
			extensions={[
				targetTransform === ViewDataTypeConstant.JSON ? json() : xml(),
				syntaxHighlighting(jsonEditorHighlightStyle),
			]}
		/>
	);
};
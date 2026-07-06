import ReactCodeMirror from '@uiw/react-codemirror';
import { Decoration, DecorationSet, EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

type JwtEditorProps = {
	id?: string;
	className?: string;
	'aria-label': string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	readOnly?: boolean;
};

const jwtEditorTheme = EditorView.theme({
	'&': {
		height: '100%',
		minHeight: '4rem',
		overflow: 'hidden',
		border: '1px solid var(--input)',
		borderRadius: 'var(--radius-lg)',
		backgroundColor: 'transparent',
	},
	'&.cm-focused': {
		outline: 'none',
		borderColor: 'var(--ring)',
		boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring), transparent 50%)',
	},
	'.cm-scroller': {
		fontFamily: 'inherit',
		fontSize: '0.875rem',
		lineHeight: '1.25rem',
	},
	'.cm-content': {
		padding: '0.5rem 0.625rem',
		caretColor: 'var(--foreground)',
	},
	'.cm-line': {
		padding: '0',
	},
	'.cm-cursor': {
		borderLeftColor: 'var(--foreground)',
	},
	'&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
		backgroundColor: 'color-mix(in oklch, var(--primary), transparent 70%)',
	},
	'.cm-jwt-header': {
		color: 'light-dark(#ef4444, #f87171)',
	},
	'.cm-jwt-payload': {
		color: 'light-dark(#059669, #34d399)',
	},
	'.cm-jwt-signature': {
		color: 'light-dark(#38bdf8, #7dd3fc)',
	},
	'.cm-jwt-separator': {
		color: 'var(--muted-foreground)',
	},
});

const mark = (decorations: { from: number; to: number; className: string }[]) => Decoration.set(
	decorations
		.filter(({ from, to }) => from >= 0 && from < to)
		.map(({ from, to, className }) => Decoration.mark({ class: className }).range(from, to)),
	true,
);

const getJwtDecorations = (value: string) => {
	const firstSeparator = value.indexOf('.');
	const secondSeparator = firstSeparator === -1 ? -1 : value.indexOf('.', firstSeparator + 1);
	const headerEnd = firstSeparator === -1 ? value.length : firstSeparator;
	const payloadStart = firstSeparator === -1 ? value.length : firstSeparator + 1;
	const payloadEnd = secondSeparator === -1 ? value.length : secondSeparator;
	const signatureStart = secondSeparator === -1 ? value.length : secondSeparator + 1;

	return mark([
		{ from: 0, to: headerEnd, className: 'cm-jwt-header' },
		{ from: firstSeparator, to: firstSeparator + 1, className: 'cm-jwt-separator' },
		{ from: payloadStart, to: payloadEnd, className: 'cm-jwt-payload' },
		{ from: secondSeparator, to: secondSeparator + 1, className: 'cm-jwt-separator' },
		{ from: signatureStart, to: value.length, className: 'cm-jwt-signature' },
	]);
};

const jwtHighlight = ViewPlugin.fromClass(class {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = getJwtDecorations(view.state.doc.toString());
	}

	update(update: ViewUpdate) {
		if (update.docChanged) {
			this.decorations = getJwtDecorations(update.state.doc.toString());
		}
	}
}, {
	decorations: (value) => value.decorations,
});

export const JwtEditor = ({
	id,
	className,
	'aria-label': ariaLabel,
	value = '',
	onChange,
	placeholder,
	readOnly = false,
}: JwtEditorProps) => (
	<ReactCodeMirror
		className={className}
		value={value}
		onChange={onChange}
		readOnly={readOnly}
		placeholder={placeholder}
		theme={jwtEditorTheme}
		basicSetup={{
			foldGutter: false,
			highlightActiveLine: false,
			highlightActiveLineGutter: false,
			lineNumbers: false,
		}}
		extensions={[
			EditorView.contentAttributes.of({
				'aria-label': ariaLabel,
				...(id ? { id } : {}),
			}),
			EditorView.lineWrapping,
			jwtHighlight,
		]}
	/>
);

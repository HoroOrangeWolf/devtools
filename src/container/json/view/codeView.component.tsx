import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { cn } from '@/lib/utils.ts';
import { UIEvent, useRef } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type PropsType = {
	type: ViewDataType;
	value: string;
	readOnly?: boolean;
	onChange?: (value: string) => void;
	className?: string;
	invalid?: boolean;
}

const languageByType: Record<ViewDataType, string> = {
	[ViewDataTypeConstant.JSON]: 'json',
	[ViewDataTypeConstant.XML]: 'xml',
	[ViewDataTypeConstant.CSV]: 'csv',
};

const editorTextClassName = 'font-mono text-sm leading-6';

export const CodeView = ({
	type,
	value,
	readOnly = false,
	onChange,
	className,
	invalid = false,
}: PropsType) => {
	const highlightedCodeRef = useRef<HTMLDivElement>(null);

	const syncScroll = (event: UIEvent<HTMLTextAreaElement>) => {
		const highlightedCode = highlightedCodeRef.current?.querySelector('pre');

		if (!highlightedCode) {
			return;
		}

		highlightedCode.scrollTop = event.currentTarget.scrollTop;
		highlightedCode.scrollLeft = event.currentTarget.scrollLeft;
	};

	return (
		<div
			className={cn(
				'group relative h-96 min-h-64 overflow-hidden rounded-lg border border-slate-700 bg-slate-950 shadow-sm transition-colors focus-within:border-cyan-500 focus-within:ring-3 focus-within:ring-cyan-500/20',
				invalid && 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20',
				className
			)}
		>
			<div
				ref={highlightedCodeRef}
				aria-hidden="true"
				className={cn('pointer-events-none absolute inset-0', editorTextClassName)}
			>
				<SyntaxHighlighter
					language={languageByType[type]}
					style={vscDarkPlus}
					customStyle={{
						background: 'transparent',
						fontFamily: 'var(--font-mono)',
						fontSize: '0.875rem',
						height: '100%',
						lineHeight: '1.5rem',
						margin: 0,
						overflow: 'auto',
						padding: '1rem',
						tabSize: 2,
						whiteSpace: 'pre',
					}}
					codeTagProps={{
						style: {
							fontFamily: 'inherit',
							fontSize: '0.875rem',
							lineHeight: '1.5rem',
							tabSize: 2,
						},
					}}
				>
					{value || ' '}
				</SyntaxHighlighter>
			</div>
			<textarea
				aria-label={`${type} code editor`}
				aria-invalid={invalid || undefined}
				data-language={languageByType[type]}
				className={cn(
					'absolute inset-0 size-full resize-none overflow-auto bg-transparent p-4 text-transparent caret-slate-100 outline-none selection:bg-cyan-500/35 selection:text-transparent disabled:cursor-not-allowed disabled:opacity-70',
					editorTextClassName
				)}
				style={{ tabSize: 2 }}
				value={value}
				readOnly={readOnly}
				spellCheck={false}
				wrap="off"
				onChange={(event) => onChange?.(event.target.value)}
				onScroll={syncScroll}
			/>
		</div>
	);
};

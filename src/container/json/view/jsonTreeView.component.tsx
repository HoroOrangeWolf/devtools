import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';
import {
	Braces,
	Brackets,
	Check,
	ChevronDown,
	ChevronRight,
	Copy,
	Pencil,
	Plus,
	Trash2,
} from 'lucide-react';
import { ContextMenu, DropdownMenu } from 'radix-ui';
import { useRef, useState } from 'react';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JsonTreeSettings = {
	defaultExpandedDepth?: number;
};

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
type Path = Array<string | number>;

type PropsType = {
	value: JsonValue;
	readOnly?: boolean;
	settings?: JsonTreeSettings;
	onChange: (value: JsonValue) => void;
};

type NodePropsType = {
	value: JsonValue;
	path: Path;
	depth: number;
	defaultExpandedDepth: number;
	readOnly: boolean;
	name?: string | number;
	isLast?: boolean;
	siblingKeys?: string[];
	onUpdate: (path: Path, value: JsonValue) => void;
	onRename?: (name: string) => void;
	onDelete?: () => void;
	onDuplicate?: () => void;
};

type NodeActions = {
	canEditKey: boolean;
	canEditValue: boolean;
	isCollection: boolean;
	currentType: JsonValueType;
	onEditKey: () => void;
	onEditValue: () => void;
	onChangeType: (type: JsonValueType) => void;
	onAddChild: () => void;
	onDuplicate?: () => void;
	onDelete?: () => void;
};

const valueTypes: JsonValueType[] = ['string', 'number', 'boolean', 'null', 'object', 'array'];
const menuContentClassName = 'z-50 min-w-44 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md';
const menuItemClassName = 'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50';
const menuSubTriggerClassName = cn(menuItemClassName, 'justify-between');

const isObject = (value: JsonValue): value is { [key: string]: JsonValue } => (
	typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getValueType = (value: JsonValue): JsonValueType => {
	if (value === null) {
		return 'null';
	}

	if (Array.isArray(value)) {
		return 'array';
	}

	return typeof value as JsonValueType;
};

const getDefaultValue = (val: JsonValue,type: JsonValueType): JsonValue => {
	switch (type) {
		case 'string': { return JSON.stringify(val);
		}
		case 'number': {
			const parsed = Number(val);
			return Number.isNaN(parsed) ? 0 : parsed;
		}
		case 'boolean': {
			return Boolean(val);
		}
		case 'null': {
			return null;
		}
		case 'object': {
			try {
				return JSON.parse(val as string);
			} catch (error) {
				console.error(error);
				return {};
			}
		}
		case 'array': {
			try {
				const res = JSON.parse(val as string);

				return Array.isArray(res) ? res : [];
			} catch (error) {
				console.error(error);
				return [];
			}
		}
	}
};

const updateAtPath = (root: JsonValue, path: Path, nextValue: JsonValue): JsonValue => {
	if (path.length === 0) {
		return nextValue;
	}

	const [head, ...tail] = path;

	if (Array.isArray(root) && typeof head === 'number') {
		return root.map((item, index) => index === head ? updateAtPath(item, tail, nextValue) : item);
	}

	if (isObject(root) && typeof head === 'string') {
		return Object.fromEntries(Object.entries(root).map(([key, item]) => (
			key === head ? [key, updateAtPath(item, tail, nextValue)] : [key, item]
		)));
	}

	return root;
};

const getUniqueKey = (object: { [key: string]: JsonValue }, base = 'newKey') => {
	let index = 0;
	let key = base;

	while (Object.hasOwn(object, key)) {
		index += 1;
		key = `${base}${index}`;
	}

	return key;
};

const getValueColor = (value: JsonPrimitive) => {
	if (value === null) return 'text-muted-foreground';
	if (typeof value === 'string') return 'text-amber-600 dark:text-amber-400';
	if (typeof value === 'number') return 'text-blue-600 dark:text-blue-400';
	return 'text-violet-600 dark:text-violet-400';
};

const getDisplayValue = (value: JsonPrimitive) => (
	typeof value === 'string' ? JSON.stringify(value) : String(value)
);

const TypeIcon = ({ type }: { type: JsonValueType }) => {
	if (type === 'object') return <Braces />;
	if (type === 'array') return <Brackets />;
	return null;
};

const DropdownActions = ({ actions }: { actions: NodeActions }) => (
	<>
		{actions.canEditKey && (
			<DropdownMenu.Item className={menuItemClassName} onSelect={actions.onEditKey}>
				<Pencil /> Edit key
			</DropdownMenu.Item>
		)}
		{actions.canEditValue && (
			<DropdownMenu.Item className={menuItemClassName} onSelect={actions.onEditValue}>
				<Pencil /> Edit value
			</DropdownMenu.Item>
		)}
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger className={menuSubTriggerClassName}>
				<span className="flex items-center gap-2"><Braces /> Change type</span>
				<ChevronRight />
			</DropdownMenu.SubTrigger>
			<DropdownMenu.Portal>
				<DropdownMenu.SubContent className={menuContentClassName} sideOffset={4}>
					{valueTypes.map((type) => (
						<DropdownMenu.Item
							key={type}
							className={menuItemClassName}
							disabled={type === actions.currentType}
							onSelect={() => actions.onChangeType(type)}
						>
							<TypeIcon type={type} /> {type}
							{type === actions.currentType && <Check className="ml-auto" />}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.SubContent>
			</DropdownMenu.Portal>
		</DropdownMenu.Sub>
		{actions.isCollection && (
			<DropdownMenu.Item className={menuItemClassName} onSelect={actions.onAddChild}>
				<Plus /> Add child
			</DropdownMenu.Item>
		)}
		{(actions.onDuplicate || actions.onDelete) && <DropdownMenu.Separator className="my-1 h-px bg-border" />}
		{actions.onDuplicate && (
			<DropdownMenu.Item className={menuItemClassName} onSelect={actions.onDuplicate}>
				<Copy /> Duplicate
			</DropdownMenu.Item>
		)}
		{actions.onDelete && (
			<DropdownMenu.Item className={cn(menuItemClassName, 'text-destructive focus:text-destructive')} onSelect={actions.onDelete}>
				<Trash2 /> Remove
			</DropdownMenu.Item>
		)}
	</>
);

const ContextActions = ({ actions }: { actions: NodeActions }) => (
	<>
		{actions.canEditKey && (
			<ContextMenu.Item className={menuItemClassName} onSelect={actions.onEditKey}>
				<Pencil /> Edit key
			</ContextMenu.Item>
		)}
		{actions.canEditValue && (
			<ContextMenu.Item className={menuItemClassName} onSelect={actions.onEditValue}>
				<Pencil /> Edit value
			</ContextMenu.Item>
		)}
		<ContextMenu.Sub>
			<ContextMenu.SubTrigger className={menuSubTriggerClassName}>
				<span className="flex items-center gap-2"><Braces /> Change type</span>
				<ChevronRight />
			</ContextMenu.SubTrigger>
			<ContextMenu.Portal>
				<ContextMenu.SubContent className={menuContentClassName} sideOffset={4}>
					{valueTypes.map((type) => (
						<ContextMenu.Item
							key={type}
							className={menuItemClassName}
							disabled={type === actions.currentType}
							onSelect={() => actions.onChangeType(type)}
						>
							<TypeIcon type={type} /> {type}
							{type === actions.currentType && <Check className="ml-auto" />}
						</ContextMenu.Item>
					))}
				</ContextMenu.SubContent>
			</ContextMenu.Portal>
		</ContextMenu.Sub>
		{actions.isCollection && (
			<ContextMenu.Item className={menuItemClassName} onSelect={actions.onAddChild}>
				<Plus /> Add child
			</ContextMenu.Item>
		)}
		{(actions.onDuplicate || actions.onDelete) && <ContextMenu.Separator className="my-1 h-px bg-border" />}
		{actions.onDuplicate && (
			<ContextMenu.Item className={menuItemClassName} onSelect={actions.onDuplicate}>
				<Copy /> Duplicate
			</ContextMenu.Item>
		)}
		{actions.onDelete && (
			<ContextMenu.Item className={cn(menuItemClassName, 'text-destructive focus:text-destructive')} onSelect={actions.onDelete}>
				<Trash2 /> Remove
			</ContextMenu.Item>
		)}
	</>
);

const NodeMenu = ({ actions }: { actions: NodeActions }) => (
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				aria-label="JSON node actions"
				className="ml-1 opacity-0 group-hover/node:opacity-100 group-focus-within/node:opacity-100 data-[state=open]:opacity-100"
			>
				<ChevronDown />
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Portal>
			<DropdownMenu.Content className={menuContentClassName} sideOffset={4} align="start">
				<DropdownActions actions={actions} />
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
);

const ContextualRow = ({
	children,
	actions,
	readOnly,
}: {
	children: React.ReactNode;
	actions: NodeActions;
	readOnly: boolean;
}) => {
	if (readOnly) return children;

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Portal>
				<ContextMenu.Content className={menuContentClassName}>
					<ContextActions actions={actions} />
				</ContextMenu.Content>
			</ContextMenu.Portal>
		</ContextMenu.Root>
	);
};

const InlineEditor = ({
	value,
	type,
	onCommit,
	onCancel,
}: {
	value: string;
	type: 'key' | 'string' | 'number';
	onCommit: (value: string) => string | undefined;
	onCancel: () => void;
}) => {
	const [draft, setDraft] = useState(value);
	const [error, setError] = useState<string>();
	const skipBlur = useRef(false);

	const commit = () => {
		const nextError = onCommit(draft);
		setError(nextError);
	};

	return (
		<span className="inline-flex flex-col align-top">
			<Input
				autoFocus
				value={draft}
				size={Math.max(2, Math.min(draft.length + 1, 36))}
				aria-label={type === 'key' ? 'Object property name' : `${type} value`}
				aria-invalid={Boolean(error)}
				className="h-6 w-auto min-w-10 max-w-72 rounded px-1.5 py-0 font-mono text-xs"
				onChange={(event) => {
					setDraft(event.target.value);
					setError(undefined);
				}}
				onBlur={() => {
					if (skipBlur.current) {
						skipBlur.current = false;
						return;
					}
					commit();
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.currentTarget.blur();
					}

					if (event.key === 'Escape') {
						skipBlur.current = true;
						onCancel();
					}
				}}
			/>
			{error && <span className="mt-1 text-xs text-destructive">{error}</span>}
		</span>
	);
};

const JsonTreeNode = ({
	value,
	path,
	depth,
	defaultExpandedDepth,
	readOnly,
	name,
	isLast = true,
	siblingKeys = [],
	onUpdate,
	onRename,
	onDelete,
	onDuplicate,
}: NodePropsType) => {
	const type = getValueType(value);
	const isCollection = Array.isArray(value) || isObject(value);
	const [isExpanded, setIsExpanded] = useState(depth < defaultExpandedDepth);
	const [isEditingKey, setIsEditingKey] = useState(false);
	const [isEditingValue, setIsEditingValue] = useState(false);

	const actions: NodeActions = {
		canEditKey: typeof name === 'string',
		canEditValue: !isCollection && value !== null,
		isCollection,
		currentType: type,
		onEditKey: () => setIsEditingKey(true),
		onEditValue: () => setIsEditingValue(true),
		onChangeType: (nextType) => onUpdate(path, getDefaultValue(value,nextType)),
		onAddChild: () => {
			if (Array.isArray(value)) onUpdate(path, [...value, null]);
			if (isObject(value)) onUpdate(path, { ...value, [getUniqueKey(value)]: null });
			setIsExpanded(true);
		},
		onDuplicate,
		onDelete,
	};

	const keyLabel = name === undefined ? null : (
		<>
			{isEditingKey && typeof name === 'string' && onRename ? (
				<InlineEditor
					value={name}
					type="key"
					onCancel={() => setIsEditingKey(false)}
					onCommit={(nextName) => {
						if (nextName !== name && siblingKeys.includes(nextName)) return 'Property name already exists.';
						onRename(nextName);
						setIsEditingKey(false);
						return;
					}}
				/>
			) : (
				<span
					className={cn('text-cyan-700 dark:text-cyan-300', typeof name === 'string' && !readOnly && 'cursor-text')}
					onDoubleClick={() => typeof name === 'string' && !readOnly && setIsEditingKey(true)}
				>
					{typeof name === 'string' ? JSON.stringify(name) : name}
				</span>
			)}
			<span className="text-muted-foreground">: </span>
		</>
	);

	if (!isCollection) {
		let valueContent: React.ReactNode;

		if (isEditingValue && (typeof value === 'string' || typeof value === 'number')) {
			valueContent = (
				<InlineEditor
					value={String(value)}
					type={typeof value}
					onCancel={() => setIsEditingValue(false)}
					onCommit={(draft) => {
						if (typeof value === 'number') {
							const jsonNumberPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
							const number = Number(draft);
							if (!jsonNumberPattern.test(draft) || !Number.isFinite(number)) return 'Enter a valid JSON number.';
							onUpdate(path, number);
						} else {
							onUpdate(path, draft);
						}
						setIsEditingValue(false);
						return;
					}}
				/>
			);
		} else if (isEditingValue && typeof value === 'boolean') {
			valueContent = (
				<select
					autoFocus
					value={String(value)}
					aria-label="Boolean value"
					className="h-6 rounded border border-input bg-background px-1 font-mono text-xs"
					onBlur={() => setIsEditingValue(false)}
					onChange={(event) => {
						onUpdate(path, event.target.value === 'true');
						setIsEditingValue(false);
					}}
					onKeyDown={(event) => {
						if (event.key === 'Escape') setIsEditingValue(false);
					}}
				>
					<option value="true">true</option>
					<option value="false">false</option>
				</select>
			);
		} else {
			valueContent = (
				<span
					className={cn(getValueColor(value), !readOnly && value !== null && 'cursor-text')}
					onDoubleClick={() => !readOnly && value !== null && setIsEditingValue(true)}
				>
					{getDisplayValue(value)}
				</span>
			);
		}

		const row = (
			<div className="group/node flex min-h-6 items-start whitespace-nowrap px-1 font-mono text-xs leading-6 hover:bg-muted/60">
				<span className="mr-1 inline-block size-4 shrink-0" />
				<span>{keyLabel}{valueContent}{!isLast && <span className="text-muted-foreground">,</span>}</span>
				{!readOnly && <NodeMenu actions={actions} />}
			</div>
		);

		return <ContextualRow actions={actions} readOnly={readOnly}>{row}</ContextualRow>;
	}

	const entries = Array.isArray(value) ? value : Object.entries(value);
	const openingCharacter = Array.isArray(value) ? '[' : '{';
	const closingCharacter = Array.isArray(value) ? ']' : '}';
	const countLabel = `${entries.length} ${Array.isArray(value) ? 'items' : 'properties'}`;
	const header = (
		<div className="group/node flex min-h-6 items-start whitespace-nowrap px-1 font-mono text-xs leading-6 hover:bg-muted/60">
			<button
				type="button"
				aria-label={isExpanded ? 'Collapse JSON node' : 'Expand JSON node'}
				className="mr-1 inline-flex size-4 shrink-0 items-center justify-center self-center text-muted-foreground hover:text-foreground"
				onClick={() => setIsExpanded((expanded) => !expanded)}
			>
				{isExpanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
			</button>
			<span>{keyLabel}<span className="text-muted-foreground">{openingCharacter}</span></span>
			{!isExpanded && <span className="ml-1 rounded bg-muted px-1 text-[10px] text-muted-foreground">{countLabel}</span>}
			{!isExpanded && <span className="text-muted-foreground">{closingCharacter}{!isLast && ','}</span>}
			{!readOnly && <NodeMenu actions={actions} />}
		</div>
	);

	return (
		<div>
			<ContextualRow actions={actions} readOnly={readOnly}>{header}</ContextualRow>
			{isExpanded && (
				<>
					<div className="ml-3 border-l border-border/70 pl-2">
						{Array.isArray(value) ? value.map((item, index) => (
							<JsonTreeNode
								key={index}
								value={item}
								name={index}
								path={[...path, index]}
								depth={depth + 1}
								defaultExpandedDepth={defaultExpandedDepth}
								readOnly={readOnly}
								isLast={index === value.length - 1}
								onUpdate={onUpdate}
								onDelete={() => onUpdate(path, value.filter((_, itemIndex) => itemIndex !== index))}
								onDuplicate={() => {
									const nextValue = [...value];
									nextValue.splice(index + 1, 0, item);
									onUpdate(path, nextValue);
								}}
							/>
						)) : Object.entries(value).map(([key, item], index, objectEntries) => (
							<JsonTreeNode
								key={key}
								value={item}
								name={key}
								path={[...path, key]}
								depth={depth + 1}
								defaultExpandedDepth={defaultExpandedDepth}
								readOnly={readOnly}
								isLast={index === objectEntries.length - 1}
								siblingKeys={Object.keys(value)}
								onUpdate={onUpdate}
								onRename={(nextKey) => onUpdate(path, Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => (
									entryKey === key ? [nextKey, entryValue] : [entryKey, entryValue]
								))))}
								onDelete={() => onUpdate(path, Object.fromEntries(Object.entries(value).filter(([entryKey]) => entryKey !== key)))}
								onDuplicate={() => {
									const duplicateKey = getUniqueKey(value, `${key}Copy`);
									const nextEntries = Object.entries(value).flatMap(([entryKey, entryValue]) => (
										entryKey === key ? [[entryKey, entryValue], [duplicateKey, entryValue]] : [[entryKey, entryValue]]
									));
									onUpdate(path, Object.fromEntries(nextEntries));
								}}
							/>
						))}
					</div>
					<div className="min-h-6 px-1 pl-6 font-mono text-xs leading-6 text-muted-foreground">
						{closingCharacter}{!isLast && ','}
					</div>
				</>
			)}
		</div>
	);
};

export const JsonTreeView = ({ value, readOnly = false, settings, onChange }: PropsType) => {
	const defaultExpandedDepth = Math.max(0, settings?.defaultExpandedDepth ?? 2);
	const updateValue = (path: Path, nextValue: JsonValue) => onChange(updateAtPath(value, path, nextValue));

	return (
		<div className="overflow-auto rounded-lg border bg-background p-2 text-foreground">
			<JsonTreeNode
				value={value}
				path={[]}
				depth={0}
				defaultExpandedDepth={defaultExpandedDepth}
				readOnly={readOnly}
				onUpdate={updateValue}
			/>
		</div>
	);
};

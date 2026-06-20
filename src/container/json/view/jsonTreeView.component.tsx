import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type JsonValueType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
type Path = Array<string | number>;

type PropsType = {
	value: JsonValue;
	readOnly?: boolean;
	onChange: (value: JsonValue) => void;
};

type NodePropsType = {
	value: JsonValue;
	path: Path;
	readOnly: boolean;
	onUpdate: (path: Path, value: JsonValue) => void;
	onDelete?: () => void;
};

const valueTypes: JsonValueType[] = ['string', 'number', 'boolean', 'null', 'object', 'array'];

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

const getDefaultValue = (type: JsonValueType): JsonValue => {
	switch (type) {
		case 'string': { return '';
		}
		case 'number': { return 0;
		}
		case 'boolean': { return false;
		}
		case 'null': { return null;
		}
		case 'object': { return {};
		}
		case 'array': { return [];
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

const getUniqueKey = (object: { [key: string]: JsonValue }) => {
	let index = 0;
	let key = 'newKey';

	while (Object.hasOwn(object, key)) {
		index += 1;
		key = `newKey${index}`;
	}

	return key;
};

const TypeSelect = ({
	value,
	disabled,
	onChange,
}: {
	value: JsonValueType;
	disabled: boolean;
	onChange: (type: JsonValueType) => void;
}) => (
	<select
		value={value}
		disabled={disabled}
		aria-label="JSON value type"
		className="h-8 rounded-lg border border-input bg-background px-2 text-sm disabled:opacity-50"
		onChange={(event) => onChange(event.target.value as JsonValueType)}
	>
		{valueTypes.map((type) => <option key={type}>{type}</option>)}
	</select>
);

const PrimitiveEditor = ({
	value,
	readOnly,
	onChange,
}: {
	value: JsonPrimitive;
	readOnly: boolean;
	onChange: (value: JsonPrimitive) => void;
}) => {
	const [numberDraft, setNumberDraft] = useState(typeof value === 'number' ? String(value) : '');
	const [numberError, setNumberError] = useState<string>();

	if (typeof value === 'string') {
		return (
			<Input
				value={value}
				readOnly={readOnly}
				aria-label="String value"
				onChange={(event) => onChange(event.target.value)}
			/>
		);
	}

	if (typeof value === 'number') {
		return (
			<div className="flex min-w-0 flex-col gap-1">
				<Input
					value={numberDraft}
					readOnly={readOnly}
					inputMode="decimal"
					aria-label="Number value"
					aria-invalid={Boolean(numberError)}
					onChange={(event) => {
						const draft = event.target.value;
						const number = Number(draft);
						setNumberDraft(draft);

						if (draft.trim() === '' || !Number.isFinite(number)) {
							setNumberError('Enter a valid JSON number.');
							return;
						}

						setNumberError(undefined);
						onChange(number);
					}}
				/>
				{numberError && <span className="text-xs text-destructive">{numberError}</span>}
			</div>
		);
	}

	if (typeof value === 'boolean') {
		return (
			<select
				value={String(value)}
				disabled={readOnly}
				aria-label="Boolean value"
				className="h-8 rounded-lg border border-input bg-background px-2 text-sm disabled:opacity-50"
				onChange={(event) => onChange(event.target.value === 'true')}
			>
				<option value="true">true</option>
				<option value="false">false</option>
			</select>
		);
	}

	return <span className="px-2 text-sm text-muted-foreground">null</span>;
};

const JsonTreeNode = ({ value, path, readOnly, onUpdate, onDelete }: NodePropsType) => {
	const type = getValueType(value);

	const controls = !readOnly && (
		<div className="flex items-center gap-1">
			<TypeSelect
				value={type}
				disabled={readOnly}
				onChange={(nextType) => onUpdate(path, getDefaultValue(nextType))}
			/>
			{onDelete && (
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					aria-label="Delete JSON value"
					onClick={onDelete}
				>
					<Trash2 />
				</Button>
			)}
		</div>
	);

	if (Array.isArray(value)) {
		return (
			<div className="flex flex-col gap-2 rounded-lg border border-border p-2">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">Array ({value.length})</span>
					{controls}
				</div>
				<div className="flex flex-col gap-2 border-l pl-3">
					{value.map((item, index) => (
						<div key={index} className="grid grid-cols-[auto_1fr] items-start gap-2">
							<span className="pt-2 text-xs text-muted-foreground">{index}</span>
							<JsonTreeNode
								value={item}
								path={[...path, index]}
								readOnly={readOnly}
								onUpdate={onUpdate}
								onDelete={() => onUpdate(path, value.filter((_, itemIndex) => itemIndex !== index))}
							/>
						</div>
					))}
					{!readOnly && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="self-start"
							onClick={() => onUpdate(path, [...value, null])}
						>
							<Plus /> Add item
						</Button>
					)}
				</div>
			</div>
		);
	}

	if (isObject(value)) {
		return (
			<div className="flex flex-col gap-2 rounded-lg border border-border p-2">
				<div className="flex items-center justify-between">
					<span className="text-xs font-medium text-muted-foreground">Object ({Object.keys(value).length})</span>
					{controls}
				</div>
				<div className="flex flex-col gap-2 border-l pl-3">
					{Object.entries(value).map(([key, item]) => (
						<ObjectEntry
							key={key}
							name={key}
							value={item}
							object={value}
							path={[...path, key]}
							readOnly={readOnly}
							onUpdate={onUpdate}
							onDelete={() => onUpdate(path, Object.fromEntries(Object.entries(value).filter(([entryKey]) => entryKey !== key)))}
						/>
					))}
					{!readOnly && (
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="self-start"
							onClick={() => onUpdate(path, { ...value, [getUniqueKey(value)]: null })}
						>
							<Plus /> Add property
						</Button>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-w-0 items-start justify-between gap-2 rounded-lg border border-border p-2">
			<div className="min-w-0 flex-1">
				<PrimitiveEditor
					key={`${typeof value}:${String(value)}`}
					value={value}
					readOnly={readOnly}
					onChange={(nextValue) => onUpdate(path, nextValue)}
				/>
			</div>
			{controls}
		</div>
	);
};

// Object entries keep key drafts locally so duplicate or empty names never mutate JSON.
const ObjectEntry = ({
	name,
	value,
	object,
	path,
	readOnly,
	onUpdate,
	onDelete,
}: {
	name: string;
	value: JsonValue;
	object: { [key: string]: JsonValue };
	path: Path;
	readOnly: boolean;
	onUpdate: (path: Path, value: JsonValue) => void;
	onDelete: () => void;
}) => {
	const [keyDraft, setKeyDraft] = useState(name);
	const [keyError, setKeyError] = useState<string>();

	const commitKey = () => {
		if (keyDraft === name) {
			setKeyError(undefined);
			return;
		}

		if (Object.hasOwn(object, keyDraft)) {
			setKeyError('Property name already exists.');
			return;
		}

		setKeyError(undefined);
		onUpdate(path.slice(0, -1), Object.fromEntries(Object.entries(object).map(([key, item]) => (
			key === name ? [keyDraft, item] : [key, item]
		))));
	};

	return (
		<div className="grid grid-cols-[minmax(100px,0.35fr)_1fr] items-start gap-2">
			<div className="flex flex-col gap-1">
				<Input
					value={keyDraft}
					readOnly={readOnly}
					aria-label="Object property name"
					aria-invalid={Boolean(keyError)}
					onChange={(event) => setKeyDraft(event.target.value)}
					onBlur={commitKey}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							event.currentTarget.blur();
						}
					}}
				/>
				{keyError && <span className="text-xs text-destructive">{keyError}</span>}
			</div>
			<JsonTreeNode
				value={value}
				path={path}
				readOnly={readOnly}
				onUpdate={onUpdate}
				onDelete={onDelete}
			/>
		</div>
	);
};

export const JsonTreeView = ({ value, readOnly = false, onChange }: PropsType) => {
	const updateValue = (path: Path, nextValue: JsonValue) => onChange(updateAtPath(value, path, nextValue));

	return (
		<div className={cn('overflow-auto rounded-lg bg-muted/20 p-2')}>
			<JsonTreeNode
				value={value}
				path={[]}
				readOnly={readOnly}
				onUpdate={updateValue}
			/>
		</div>
	);
};


// TODO: Zablokować textarea
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { cn } from '@/lib/utils.ts';

const exp = `
{
"test: 123,
}
`;

export const JsonFormatterContainer = () => {
	return (
		<div className={cn('grid grid-cols-[1fr_40px_1fr]')}>
			<JsonEditorContainer value={exp} />
			<div>
				Test
			</div>
			<JsonEditorContainer value={exp} />
		</div>
	);
};
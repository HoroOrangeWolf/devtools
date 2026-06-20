
// TODO: Zablokować textarea
import { JsonEditorContainer } from '@/container/json/jsonEditor.container.tsx';
import { cn } from '@/lib/utils.ts';
import { useState } from 'react';

const exp = `{
  "employees": {
    "employee": [
      {
        "id": "1",
        "firstName": "Tom",
        "lastName": "Cruise",
        "photo": "https://jsonformatter.org/img/tom-cruise.jpg"
      },
      {
        "id": "2",
        "firstName": "Maria",
        "lastName": "Sharapova",
        "photo": "https://jsonformatter.org/img/Maria-Sharapova.jpg"
      },
      {
        "id": "3",
        "firstName": "Robert",
        "lastName": "Downey Jr.",
        "photo": "https://jsonformatter.org/img/Robert-Downey-Jr.jpg"
      }
    ]
  }
}`;

export const JsonFormatterContainer = () => {
	const [value, setValue] = useState<string>(exp);

	return (
		<div className={cn('grid grid-cols-[1fr_40px_1fr]')}>
			<JsonEditorContainer value={value} onChange={({ value }) => setValue(value)} />
			<div>
				Test
			</div>
			<JsonEditorContainer value={value} />
		</div>
	);
};
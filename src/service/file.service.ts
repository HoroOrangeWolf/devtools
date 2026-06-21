import Papaparse from 'papaparse';
import { XMLParser } from 'fast-xml-parser';
import XMLBuilder from 'fast-xml-builder';

export type ContentFormat = 'text/csv' | 'application/json' | 'text/plain' | 'application/xml';

export type FileExtension = '.csv' | '.json' | '.xml';

const downloadFile = (fileName: string, content: string, format: ContentFormat) => {
	const blob = new Blob([content], { type: `${format};charset=utf-8;` });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const readFileContent = async (file: File): Promise<string> => file.text();

const isAcceptedFile = (file: File, formats: (FileExtension | ContentFormat)[]) => {
	const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : '';

	return formats.some((format) => format === file.type || format === extension);
};

const getFileContent = async (formats: (FileExtension | ContentFormat)[]): Promise<string> =>
	new Promise((resolve, reject) => {
		const input = document.createElement('input');

		input.type = 'file';
		input.accept = formats.join(',');

		input.addEventListener('change', async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];

			if (!file) {
				resolve('');
				return;
			}

			try {
				resolve(await readFileContent(file));
			} catch (error) {
				reject(error);
			}
		});

		input.click();
	});

const transformContentToJson = (content: string, format: ContentFormat): object => {
	switch (format) {
		case 'application/json': {
			return JSON.parse(content);
		}
		case 'text/csv': {
			return Papaparse.parse(content)
				.data;
		}
		case 'application/xml': {
			const parser = new XMLParser();

			return parser.parse(content);
		}
		default: {
			throw new Error(`Unsupported file extension: ${format}`);
		}
	}
};

const readFileAsJson = async (file: File): Promise<object> => {
	const fileExtension = file.name.split('.', 2)[1];
	const result = await file.text();

	switch (fileExtension) {
		case 'json': {
			return JSON.parse(result);
		}
		case 'csv': {
			const val = Papaparse.parse(result);

			if (val.data.length > 0) {
				return val.data;
			}

			const errorMessage = val.errors.map(({ message, row }) => `${row ? `${row}: ` : ''}${message}`).join(',');

			throw new Error(`${errorMessage}`);
		}
		case 'xml': {
			const parser = new XMLParser();

			return parser.parse(result);
		}
		default: {
			throw new Error(`Unsupported file extension: ${fileExtension}`);
		}
	}
};

type FormatOptions = {
	// Doesn't work for csv and for xml it only enables formating
	tabs?: number;
}

const transformJsonToTarget = (content: object, format: ContentFormat, options?: FormatOptions) => {
	switch (format) {
		case 'application/json': {
			return JSON.stringify(content, null, options?.tabs);
		}
		case 'application/xml': {
			const builder = new XMLBuilder({ format: !!options?.tabs });

			return builder.build(content);
		}
		case 'text/csv': {
			return Papaparse.unparse(content as any);
		}
		default: {
			throw new Error(`Unsupported file extension: ${format}`);
		}
	}
};

export const FileService = {
	downloadFile,
	getFileContent,
	isAcceptedFile,
	readFileContent,
	readFileAsJson,
	transformContentToJson,
	transformJsonToTarget,
};

export type ContentFormat = 'text/csv' | 'application/json' | 'text/plain';

export type FileExtension = '.csv' | '.json';

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

export const FileService = {
	downloadFile,
	getFileContent,
	isAcceptedFile,
	readFileContent,
};

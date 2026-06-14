
type Formats = '.csv,text/csv' | '.json';

const getFileContent = async (formats: Formats[]): Promise<string> =>
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
				resolve(await file.text());
			} catch (error) {
				reject(error);
			}
		});

		input.click();
	});

export const FileService = {
	getFileContent,
};
import Papaparse from 'papaparse';

const downloadCSV = (fileName: string, value: object[]) => {
	const csv = Papaparse.unparse(value, {});
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');

	link.href = url;
	link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const uploadCSV = async (): Promise<string> =>
	new Promise((resolve, reject) => {
		const input = document.createElement('input');

		input.type = 'file';
		input.accept = '.csv,text/csv';

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

export const CsvService = { downloadCSV, uploadCSV };

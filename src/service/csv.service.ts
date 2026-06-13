import Papaparse from 'papaparse';

const downloadCSV = (fileName: string, value: object[]) => {
	const csv = Papaparse.unparse(value);
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

export const CsvService = { downloadCSV };

import Papaparse, { ParseError, UnparseConfig } from 'papaparse';
import { CsvFormatsConstant, CsvFormatsType } from '@/service/constant/csvFormats.constant.ts';

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

type ResultType = {
	content: string;
	errors: ParseError[];
}

const parseCSV = async (targetFormat: CsvFormatsType, content: string, config: UnparseConfig): Promise<ResultType> => {
	let entries: object[] = [];
	let errors: ParseError[] = [];

	try {
		entries = JSON.parse(content);
	} catch {
		const result = Papaparse.parse(content);

		entries = result.data as object[];
		errors = result.errors ?? [];
	}

	return {
		content: targetFormat === CsvFormatsConstant.CSV ? Papaparse.unparse(entries, config) : JSON.stringify(entries),
		errors
	};
};

export const CsvService = { downloadCSV, parseCSV };

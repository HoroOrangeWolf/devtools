import Papaparse, { ParseError, UnparseConfig } from 'papaparse';
import { CsvFormatsConstant, CsvFormatsType } from '@/service/constant/csvFormats.constant.ts';
import { FileService } from '@/service/file.service.ts';

const downloadCSV = (fileName: string, value: object[]) => {
	const csv = Papaparse.unparse(value, {});

	FileService.downloadFile(fileName, csv, 'text/csv');
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

	const result = Papaparse.parse(Papaparse.unparse(entries, {
		...config,
		delimiter: '"'
	}));

	return {
		content: targetFormat === CsvFormatsConstant.CSV ? Papaparse.unparse(entries, config) : JSON.stringify(result.data, null, 2),
		errors
	};
};

export const CsvService = { downloadCSV, parseCSV };

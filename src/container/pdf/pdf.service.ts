import { PDFDocument } from '@cantoo/pdf-lib';


const concatPdfFiles = async (...files: File[]): Promise<File> => {
	const pdfDoc = await PDFDocument.create();

	for (const file of files) {
		const pdfBytes = await file.bytes();

		const firstPdf = await PDFDocument.load(pdfBytes);

		const copiedPages = await pdfDoc.copyPages(firstPdf, firstPdf.getPageIndices());

		for (const page of copiedPages) {
			pdfDoc.addPage(page);
		}
	}

	const savedFile = await pdfDoc.save();

	const arrayBuffer = new ArrayBuffer(savedFile.byteLength);
	new Uint8Array(arrayBuffer).set(savedFile);

	return new File(
		[arrayBuffer],
		'merged.pdf',
		{ type: 'application/pdf' },
	);
};

const shufflePdf = async (file: File, pageOrder: number[]) => {
	const pdfDoc = await PDFDocument.create();

	const pdfBytes = await file.bytes();

	const pdfToHandle = await PDFDocument.load(pdfBytes);

	const pageIndexes = pageOrder.map((val) => val - 1);

	const copiedPages = await pdfDoc.copyPages(pdfToHandle, pageIndexes);

	for (const page of copiedPages) {
		pdfDoc.addPage(page);
	}

	const modifiedPdf = await pdfDoc.save();

	const arrayBuffer = new ArrayBuffer(modifiedPdf.byteLength);
	new Uint8Array(arrayBuffer).set(modifiedPdf);

	return new File(
		[arrayBuffer],
		'merged.pdf',
		{ type: 'application/pdf' },
	);
};

export const PdfService = {
	shufflePdf,
	concatPdfFiles
};
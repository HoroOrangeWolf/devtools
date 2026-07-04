/// <reference types="cypress" />

import { PDFDocument } from '@cantoo/pdf-lib';

type PageSize = [width: number, height: number];

type CypressBuffer = ReturnType<typeof Cypress.Buffer.from>;

const createPdf = async (pageSizes: PageSize[]): Promise<CypressBuffer> => {
	const document = await PDFDocument.create();

	for (const pageSize of pageSizes) {
		document.addPage(pageSize);
	}

	return Cypress.Buffer.from(await document.save());
};

const getPageOrder = () => cy.get('[data-source-page-number]').then(($pages) =>
	[...$pages].map((page) => page.dataset.sourcePageNumber));

const openPageAction = (page: number, action: 'Move To' | 'Remove' | 'Replace With') => {
	cy.get(`[aria-label="Actions for page ${page}"]`).click();
	cy.contains('[role="menuitem"]', action).click();
};

describe('PDF utilities page', () => {
	let twoPagePdf: CypressBuffer;
	let onePagePdf: CypressBuffer;

	before(async () => {
		twoPagePdf = await createPdf([[300, 400], [400, 300]]);
		onePagePdf = await createPdf([[300, 400]]);
	});

	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/pdf');
		cy.get('[data-ishydrated=true').should('exist');
		cy.get('[aria-label="CSV file dropzone"]').selectFile({
			contents: twoPagePdf,
			fileName: 'first.pdf',
			mimeType: 'application/pdf',
		}, {
			action: 'drag-drop',
		});
		cy.get('[data-source-page-number]').should('have.length', 2);
	});

	it('exposes the PDF page content and SEO metadata', () => {
		cy.title().should('equal', 'PDF Merger and Page Organizer Tool | Dev Utils');
		cy.get('meta[name="description"]')
			.should('have.attr', 'content', 'Merge PDF files, reorder, preview, swap, and remove pages locally in your browser without uploading documents.');
		cy.get('link[rel="canonical"]').invoke('attr', 'href').then((canonicalUrl) => {
			expect(canonicalUrl).to.be.a('string');
			expect(new URL(canonicalUrl ?? '').pathname).to.equal('/pdf');

			cy.get('script[type="application/ld+json"]').then(($script) => {
				const structuredData = JSON.parse($script.text());

				expect(structuredData).to.include({
					'@type': 'WebApplication',
					name: 'PDF Merger and Page Organizer Tool',
					isAccessibleForFree: true,
				});
				expect(structuredData.url).to.equal(canonicalUrl);
				expect(structuredData.featureList).to.include('Reorder PDF pages with drag and drop');
			});
		});
		cy.contains('h2', 'PDF Merger and Page Organizer').should('be.visible');
		cy.contains('Merge and organize PDF pages locally in your browser.').should('be.visible');
	});

	it('starts with download disabled until a PDF is selected', () => {
		cy.reload();
		cy.get('[data-ishydrated=true').should('exist');
		cy.contains('button', 'Download').should('be.disabled');
		cy.contains('button', 'Upload').should('be.enabled');
		cy.contains('Drop file here').should('be.visible');
	});

	it('opens a larger page preview dialog', () => {
		let thumbnailWidth = 0;

		cy.get('[aria-label="View page 1"] canvas').then(($canvas) => {
			thumbnailWidth = $canvas[0].getBoundingClientRect().width;
		});
		cy.get('[aria-label="View page 1"]').click();

		cy.get('[role="dialog"]').within(() => {
			cy.contains('Page 1 preview').should('be.visible');
			cy.get('canvas').should(($canvas) => {
				expect($canvas[0].getBoundingClientRect().width).to.be.greaterThan(thumbnailWidth);
			});
		});
	});

	it('moves a page to a chosen position', () => {
		openPageAction(1, 'Move To');
		cy.get('[aria-label="Target page position"]').type('2');
		cy.get('[role="dialog"]').contains('button', 'Move').click();

		getPageOrder().should('deep.equal', ['2', '1']);
		cy.get('[role="dialog"]').should('not.exist');
	});

	it('validates the selected page position', () => {
		openPageAction(1, 'Move To');
		cy.get('[aria-label="Target page position"]').type('1');
		cy.get('[role="dialog"]').contains('button', 'Move').click();

		cy.contains('Choose a different page position.').should('be.visible');
		getPageOrder().should('deep.equal', ['1', '2']);
	});

	it('swaps two pages', () => {
		openPageAction(1, 'Replace With');
		cy.get('[aria-label="Target page position"]').type('2');
		cy.get('[role="dialog"]').contains('button', 'Replace').click();

		getPageOrder().should('deep.equal', ['2', '1']);
	});

	it('cancels and confirms page removal', () => {
		openPageAction(1, 'Remove');
		cy.get('[role="alertdialog"]').contains('button', 'Cancel').click();
		getPageOrder().should('deep.equal', ['1', '2']);

		openPageAction(1, 'Remove');
		cy.get('[role="alertdialog"]').contains('button', 'Remove').click();
		getPageOrder().should('deep.equal', ['2']);
	});

	it('downloads a valid PDF with the selected page order', () => {
		openPageAction(1, 'Move To');
		cy.get('[aria-label="Target page position"]').type('2');
		cy.get('[role="dialog"]').contains('button', 'Move').click();
		cy.contains('button', 'Download').click();

		cy.readFile('cypress/downloads/merged.pdf', null).then(async (content: Buffer) => {
			const downloadedPdf = await PDFDocument.load(Uint8Array.from(content));
			const pageSizes = downloadedPdf.getPages().map((page) => page.getSize());

			expect(pageSizes).to.deep.equal([
				{ width: 400, height: 300 },
				{ width: 300, height: 400 },
			]);
		});
	});

	it('preserves page ratios and stretches thumbnail backgrounds to the row height', () => {
		cy.get<HTMLCanvasElement>('[aria-label="View page 1"] canvas').should(($canvas) => {
			expect($canvas[0].height).to.be.greaterThan($canvas[0].width);
		});
		cy.get<HTMLCanvasElement>('[aria-label="View page 2"] canvas').should(($canvas) => {
			expect($canvas[0].width).to.be.greaterThan($canvas[0].height);
		});

		cy.get('[data-pdf-thumbnail-frame]').then(($frames) => {
			const portraitFrame = $frames[0].getBoundingClientRect();
			const landscapeFrame = $frames[1].getBoundingClientRect();
			const portraitPage = $frames[0].querySelector('button[aria-label^="View page"]')?.getBoundingClientRect();
			const landscapePage = $frames[1].querySelector('button[aria-label^="View page"]')?.getBoundingClientRect();

			expect(portraitPage).to.not.equal(undefined);
			expect(landscapePage).to.not.equal(undefined);

			if (!portraitPage || !landscapePage) {
				throw new Error('Expected both PDF thumbnails to be rendered.');
			}

			expect(portraitFrame.height).to.be.closeTo(landscapeFrame.height, 0.5);
			expect(portraitPage.width).to.be.closeTo(landscapePage.width, 0.5);
			expect(portraitPage.height).to.be.greaterThan(portraitPage.width);
			expect(landscapePage.width).to.be.greaterThan(landscapePage.height);
			expect(portraitPage.top + portraitPage.height / 2)
				.to.be.closeTo(portraitFrame.top + portraitFrame.height / 2, 0.5);
			expect(landscapePage.top + landscapePage.height / 2)
				.to.be.closeTo(landscapeFrame.top + landscapeFrame.height / 2, 0.5);
		});
	});

	it('shows before and after insertion indicators while dragging', () => {
		cy.get('[data-source-page-number="1"]').then(($source) => {
			cy.get('[data-source-page-number="2"]').then(($target) => {
				const sourceRectangle = $source[0].getBoundingClientRect();
				const targetRectangle = $target[0].getBoundingClientRect();

				cy.wrap($source).trigger('mousedown', {
					button: 0,
					clientX: sourceRectangle.left + sourceRectangle.width / 2,
					clientY: sourceRectangle.top + sourceRectangle.height / 2,
				});
				cy.get('body').trigger('mousemove', {
					button: 0,
					clientX: targetRectangle.left + targetRectangle.width / 4,
					clientY: targetRectangle.top + targetRectangle.height / 2,
				});
				cy.wrap($target).should('have.attr', 'data-drop-indicator', 'before');

				cy.get('body').trigger('mousemove', {
					button: 0,
					clientX: targetRectangle.left + targetRectangle.width * 3 / 4,
					clientY: targetRectangle.top + targetRectangle.height / 2,
				});
				cy.wrap($target).should('have.attr', 'data-drop-indicator', 'after');
				cy.get('body').trigger('mouseup');
			});
		});

		cy.get('[data-source-page-number]').then(($pages) => {
			expect([...$pages].map((page) => page.dataset.sourcePageNumber)).to.deep.equal(['2', '1']);
		});
		cy.get('[data-drop-indicator]').should('not.exist');
	});

	it('snaps to the nearest insertion edge when dropped in a grid gap', () => {
		cy.get('[aria-label="CSV file dropzone"]').selectFile({
			contents: onePagePdf,
			fileName: 'second.pdf',
			mimeType: 'application/pdf',
		}, {
			action: 'drag-drop',
		});
		cy.get('[data-source-page-number]').should('have.length', 3);

		cy.get('[data-source-page-number="1"]').then(($source) => {
			cy.get('[data-source-page-number="3"]').then(($target) => {
				const sourceRectangle = $source[0].getBoundingClientRect();
				const targetRectangle = $target[0].getBoundingClientRect();

				cy.wrap($source).trigger('mousedown', {
					button: 0,
					clientX: sourceRectangle.left + sourceRectangle.width / 2,
					clientY: sourceRectangle.top + sourceRectangle.height / 2,
				});
				cy.get('body').trigger('mousemove', {
					button: 0,
					clientX: targetRectangle.left - 8,
					clientY: targetRectangle.top + targetRectangle.height / 2,
				});
				cy.wrap($target).should('have.attr', 'data-drop-indicator', 'before');
				cy.get('body').trigger('mouseup');
			});
		});

		cy.get('[data-source-page-number]').then(($pages) => {
			expect([...$pages].map((page) => page.dataset.sourcePageNumber)).to.deep.equal(['2', '1', '3']);
		});
	});

	it('keeps drag-and-drop working after another PDF is added', () => {
		cy.get('[aria-label="CSV file dropzone"]').selectFile({
			contents: onePagePdf,
			fileName: 'second.pdf',
			mimeType: 'application/pdf',
		}, {
			action: 'drag-drop',
		});
		cy.get('[data-source-page-number]').should('have.length', 3);

		cy.get('[data-source-page-number="1"]').then(($source) => {
			cy.get('[data-source-page-number="3"]').then(($target) => {
				const sourceRectangle = $source[0].getBoundingClientRect();
				const targetRectangle = $target[0].getBoundingClientRect();

				cy.wrap($source).trigger('mousedown', {
					button: 0,
					clientX: sourceRectangle.left + sourceRectangle.width / 2,
					clientY: sourceRectangle.top + sourceRectangle.height / 2,
				});
				cy.get('body').trigger('mousemove', {
					button: 0,
					clientX: targetRectangle.left + targetRectangle.width / 2,
					clientY: targetRectangle.top + targetRectangle.height / 2,
				});
				cy.get('body').trigger('mouseup');
			});
		});

		cy.get('[data-source-page-number]').then(($pages) => {
			expect([...$pages].map((page) => page.dataset.sourcePageNumber)).to.deep.equal(['2', '3', '1']);
		});
		cy.get('[role="dialog"]').should('not.exist');
	});
});

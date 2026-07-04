/// <reference types="cypress" />

import { PDFDocument } from '@cantoo/pdf-lib';

const createPdf = async (pageCount: number) => {
	const document = await PDFDocument.create();

	for (let index = 0; index < pageCount; index++) {
		document.addPage([300, 400]);
	}

	return Cypress.Buffer.from(await document.save());
};

describe('PDF utilities page', () => {
	let twoPagePdf: Cypress.Buffer;
	let onePagePdf: Cypress.Buffer;

	before(async () => {
		twoPagePdf = await createPdf(2);
		onePagePdf = await createPdf(1);
	});

	beforeEach(() => {
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

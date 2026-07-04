/// <reference types="cypress" />

import { PDFDocument } from '@cantoo/pdf-lib';

type PageSize = [width: number, height: number];

const createPdf = async (pageSizes: PageSize[]) => {
	const document = await PDFDocument.create();

	for (const pageSize of pageSizes) {
		document.addPage(pageSize);
	}

	return Cypress.Buffer.from(await document.save());
};

describe('PDF utilities page', () => {
	let twoPagePdf: Cypress.Buffer;
	let onePagePdf: Cypress.Buffer;

	before(async () => {
		twoPagePdf = await createPdf([[300, 400], [400, 300]]);
		onePagePdf = await createPdf([[300, 400]]);
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

	it('preserves page ratios and stretches thumbnail backgrounds to the row height', () => {
		cy.get('[data-pdf-thumbnail-frame]').then(($frames) => {
			const portraitFrame = $frames[0].getBoundingClientRect();
			const landscapeFrame = $frames[1].getBoundingClientRect();
			const portraitCanvas = $frames[0].querySelector('canvas')?.getBoundingClientRect();
			const landscapeCanvas = $frames[1].querySelector('canvas')?.getBoundingClientRect();

			expect(portraitCanvas).to.not.equal(undefined);
			expect(landscapeCanvas).to.not.equal(undefined);

			if (!portraitCanvas || !landscapeCanvas) {
				throw new Error('Expected both PDF thumbnail canvases to be rendered.');
			}

			expect(portraitFrame.height).to.be.closeTo(landscapeFrame.height, 0.5);
			expect(portraitCanvas.width).to.be.closeTo(landscapeCanvas.width, 0.5);
			expect(portraitCanvas.height).to.be.greaterThan(portraitCanvas.width);
			expect(landscapeCanvas.width).to.be.greaterThan(landscapeCanvas.height);
			expect(portraitCanvas.top + portraitCanvas.height / 2)
				.to.be.closeTo(portraitFrame.top + portraitFrame.height / 2, 0.5);
			expect(landscapeCanvas.top + landscapeCanvas.height / 2)
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

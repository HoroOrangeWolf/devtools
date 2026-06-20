/// <reference types="cypress" />

const sourceContent = () => cy.get('[aria-label="Source content"]');
const convertedContent = () => cy.get('[aria-label="Converted content"]');

describe('Base64 utilities page', () => {
	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/base');
		cy.get('astro-island[component-export="Base64Container"]').should('not.have.attr', 'ssr');
		cy.get('[data-ishydrated=true').should('exist');
	});

	it('encodes plain text to Base64 by default', () => {
		cy.contains('h2', 'Base64 Encoder').should('be.visible');

		sourceContent().type('Hello Dev Utils!');

		convertedContent().should('have.value', 'SGVsbG8gRGV2IFV0aWxzIQ==');
	});

	it('decodes Base64 content', () => {
		cy.contains('button', 'Decode').click();
		sourceContent().type('SGVsbG8gRGV2IFV0aWxzIQ==');

		convertedContent().should('have.value', 'Hello Dev Utils!');
	});

	it('encodes and decodes URL-safe Base64 content', () => {
		cy.get('[aria-label="Base64 variant"]').click();
		cy.contains('[role="option"]', 'Url-safe Base64').click();

		sourceContent().type('?>');
		convertedContent().should('have.value', 'Pz4');

		cy.contains('button', 'Decode').click();
		sourceContent().clear().type('Pz4');

		convertedContent().should('have.value', '?>');
	});

	it('downloads the converted result', () => {
		sourceContent().type('Hello Dev Utils!');
		convertedContent().should('have.value', 'SGVsbG8gRGV2IFV0aWxzIQ==');

		cy.contains('button', 'Download Result').click();

		cy.readFile('cypress/downloads/encode_result.txt').then((content: string) => {
			expect(content).to.equal('SGVsbG8gRGV2IFV0aWxzIQ==');
		});
	});

	it('copies the converted result to clipboard', () => {
		sourceContent().type('Hello Dev Utils!');
		convertedContent().should('have.value', 'SGVsbG8gRGV2IFV0aWxzIQ==');

		cy.window().then((window) => {
			cy.stub(window.navigator.clipboard, 'writeText').as('writeClipboard');
		});

		cy.contains('button', 'Copy to clipboard').click();

		cy.get('@writeClipboard').should('have.been.calledOnceWith', 'SGVsbG8gRGV2IFV0aWxzIQ==');
	});
});

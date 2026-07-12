/// <reference types="cypress" />

describe('Unix timestamp converter page', () => {
	beforeEach(() => {
		cy.visit('/unixTimestamp');
		cy.get('[data-ishydrated="true"]').should('exist');
	});

	it('converts a Unix timestamp to a readable UTC date', () => {
		cy.contains('h2', 'Unix → Date').should('be.visible');
		cy.get('#timestamp_val').clear().type('0');

		cy.contains('div', /^UTC:/).should('contain.text', '01/Jan/1970 00:00:00');
	});

	it('converts a date and time to a Unix timestamp', () => {
		cy.contains('section', 'Date → Unix').within(() => {
			cy.get('button').first().click();
		});

		cy.get('[data-slot="calendar"]').within(() => {
			cy.get('select').eq(0).select('Jan');
			cy.get('select').eq(1).select('1970');
			cy.get('[data-day="1/1/1970"]').click();
		});

		cy.contains('section', 'Date → Unix').within(() => {
			cy.get('input[type="time"]').clear().type('00:00:00');
			cy.contains('div', /^UTC:/).should('contain.text', '0');
		});
	});

	it('exposes Unix timestamp SEO metadata', () => {
		cy.title().should('equal', 'Unix Timestamp Converter | Dev Utils');
		cy.get('meta[name="description"]')
			.should('have.attr', 'content', 'Convert Unix timestamps to readable dates and times, or turn dates into Unix timestamps locally in your browser.');

		cy.get('link[rel="canonical"]').invoke('attr', 'href').then((canonicalUrl) => {
			expect(canonicalUrl).to.be.a('string');
			expect(new URL(canonicalUrl ?? '').pathname).to.equal('/unixTimestamp');

			cy.get('script[type="application/ld+json"]').then(($script) => {
				const structuredData = JSON.parse($script.text());

				expect(structuredData).to.include({
					'@type': 'WebApplication',
					name: 'Unix Timestamp Converter',
					isAccessibleForFree: true,
				});
				expect(structuredData.url).to.equal(canonicalUrl);
				expect(structuredData.featureList).to.include('Convert dates and times to Unix timestamps');
			});
		});
	});
});

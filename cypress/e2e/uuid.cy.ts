/// <reference types="cypress" />

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;
const uuidV4Pattern = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;
const uuidV7Pattern = /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/;

const getGeneratedValues = () => cy.get('ul[role="list"] li');

describe('UUID generator page', () => {
	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/uuid');
	});

	it('generates the requested amount of UUID v4 values by default', () => {
		cy.contains('h2', 'UUID Generator').should('be.visible');

		getGeneratedValues()
			.should('have.length', 1)
			.first()
			.invoke('text')
			.should((text) => {
				expect(text.trim()).to.match(/^1\./);
				expect(text.trim().replace(/^1\.\s*/, '')).to.match(uuidV4Pattern);
			});

		cy.get('[aria-label="Generate Values Count"]').clear().type('3');
		cy.contains('button', 'Generate').click();

		getGeneratedValues().should('have.length', 3);
		getGeneratedValues().each(($item, index) => {
			const value = $item.text().trim().replace(`${index + 1}.`, '').trim();

			expect(value).to.match(uuidV4Pattern);
		});
	});

	it('switches UUID version and exports generated values as CSV', () => {
		cy.get('[aria-label="UUID version"]').click();
		cy.contains('[role="option"]', 'V7').click();
		cy.get('[aria-label="Generate Values Count"]').clear().type('2');
		cy.contains('button', 'Generate').click();

		getGeneratedValues().should('have.length', 2);
		getGeneratedValues().each(($item, index) => {
			const value = $item.text().trim().replace(`${index + 1}.`, '').trim();

			expect(value).to.match(uuidV7Pattern);
		});

		cy.contains('button', 'Export').click();

		cy.readFile('cypress/downloads/generated_values.csv').then((content: string) => {
			const lines = content.trim().split(/\r?\n/);

			expect(lines).to.have.length(3);
			expect(lines[0]).to.equal('uuid');
			expect(lines[1]).to.match(uuidPattern);
			expect(lines[2]).to.match(uuidPattern);
		});
	});
});

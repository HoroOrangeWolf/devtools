/// <reference types="cypress" />

const sourceContent = () => cy.get('[aria-label="Source content"]');
const convertedContent = () => cy.get('[aria-label="Converted content"]');

describe('CSV utilities page', () => {
	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/csv');
	});

	it('converts pasted CSV content to formatted JSON', () => {
		cy.contains('h2', 'Utils').should('be.visible');

		sourceContent().type('name,age\nAda,37\nLinus,54');
		cy.get('[aria-label="Output format"]').click();
		cy.contains('[role="option"]', 'JSON').click();

		convertedContent().should(($textarea) => {
			const parsed = JSON.parse($textarea.val() as string);

			expect(parsed).to.deep.equal([
				['name', 'age'],
				['Ada', '37'],
				['Linus', '54'],
			]);
		});
	});

	it('applies CSV output options while converting JSON input', () => {
		sourceContent().type('[["name","age"],["Ada","37"]]', {
			parseSpecialCharSequences: false,
		});

		cy.get('#delimiter').clear().type(';');
		convertedContent().should(($textarea) => {
			expect(($textarea.val() as string).replaceAll('\r\n', '\n')).to.equal('name;age\nAda;37');
		});

		cy.get('#quote').click();
		convertedContent().should(($textarea) => {
			expect(($textarea.val() as string).replaceAll('\r\n', '\n')).to.equal('"name";"age"\n"Ada";"37"');
		});

		cy.get('#quoteChar').should('be.enabled').clear().type("'");
		convertedContent().should(($textarea) => {
			expect(($textarea.val() as string).replaceAll('\r\n', '\n')).to.equal("'name';'age'\n'Ada';'37'");
		});
	});

	it('exports converted CSV content', () => {
		sourceContent().type('[["name","age"],["Ada","37"]]', {
			parseSpecialCharSequences: false,
		});
		convertedContent().should(($textarea) => {
			expect(($textarea.val() as string).replaceAll('\r\n', '\n')).to.equal('name,age\nAda,37');
		});
		cy.contains('button', 'Export').click();

		cy.readFile('cypress/downloads/export.csv').then((content: string) => {
			expect(content.replaceAll('\r\n', '\n')).to.equal('name,age\nAda,37');
		});
	});
});

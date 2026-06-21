/// <reference types="cypress" />

const editableCodeEditor = () => cy.get('textarea[aria-label="JSON code editor"]:not([readonly])');
const outputViewButton = (view: string) => cy.get(`svg[aria-label="${view} view"]`).eq(1).closest('button');

const selectTransform = (format: 'JSON' | 'XML' | 'CSV') => {
	cy.contains('label', 'Transform to').parent().find('button').click();
	cy.contains('[role="option"]', format).click();
};

describe('JSON formatter code editor', () => {
	beforeEach(() => {
		cy.visit('/jsonformatter');
		cy.get('astro-island[component-export="JsonFormatterRoot"]').should('not.have.attr', 'ssr');
		editableCodeEditor().should('be.visible');
	});

	it('edits highlighted JSON and reports invalid input', () => {
		editableCodeEditor().should('not.have.attr', 'readonly');
		editableCodeEditor()
			.clear()
			.type('{"name":', { parseSpecialCharSequences: false })
			.should('have.value', '{"name":');

		cy.contains('Invalid JSON').should('be.visible');
		editableCodeEditor().should('have.attr', 'data-language', 'json');
	});

	it('keeps the output editor read-only and highlights each selected format', () => {
		cy.get('textarea[aria-label="JSON code editor"][readonly]').should('exist');

		selectTransform('XML');
		cy.get('textarea[aria-label="XML code editor"][readonly]')
			.should('have.attr', 'data-language', 'xml');

		selectTransform('CSV');
		cy.get('textarea[aria-label="CSV code editor"][readonly]')
			.should('have.attr', 'data-language', 'csv');
	});

	it('leaves Tree for Code on non-JSON data and preserves Raw mode', () => {
		outputViewButton('Tree').click();
		selectTransform('XML');
		cy.get('textarea[aria-label="XML code editor"]').should('exist');

		outputViewButton('Raw').click();
		selectTransform('CSV');
		cy.get('textarea[aria-label="CSV code editor"]').should('not.exist');
	});
});

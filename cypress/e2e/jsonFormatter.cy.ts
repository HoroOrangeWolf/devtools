/// <reference types="cypress" />

type DataFormat = 'JSON' | 'XML' | 'CSV';
type View = 'Code' | 'Raw' | 'Tree';

const sourceCodeEditor = () => cy.get('.cm-content[role="textbox"]:not([aria-readonly="true"])');
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const outputCodeEditor = (_format: Exclude<DataFormat, 'CSV'>) =>
	cy.get('.cm-content[role="textbox"][aria-readonly="true"]');
const rawOutputEditor = () => cy.get('textarea[data-slot="textarea"][readonly]');
const errorBanner = () => cy.get('[role="alert"]');
const downloadButton = () => cy.contains('button', 'Download');
const outputViewButton = (view: View) => cy.get(`svg[aria-label="${view} view"]`).eq(1).closest('button');

const codeEditorValue = ($editor: JQuery<HTMLElement>) =>
	Array.from($editor[0].querySelectorAll('.cm-line'))
		.map((line) => line.textContent ?? '')
		.join('\n');

const selectTransform = (format: DataFormat) => {
	cy.contains('label', 'Transform to').parent().find('button').click();
	cy.contains('[role="option"]', format).click();
};

const selectTabCount = (tabCount: 1 | 2 | 3) => {
	cy.contains('label', 'JSON tabs').parent().find('button').click();
	cy.contains('[role="option"]', `Tab ${tabCount}`).click();
};

const setSourceJson = (value: unknown) => {
	const json = JSON.stringify(value);

	sourceCodeEditor()
		.clear()
		.type(json, { parseSpecialCharSequences: false })
		.should(($editor) => {
			expect(codeEditorValue($editor)).to.equal(json);
		});
};

const expectJsonOutput = (value: unknown, spaces?: number) => {
	outputCodeEditor('JSON').should(($editor) => {
		expect(codeEditorValue($editor)).to.equal(JSON.stringify(value, null, spaces));
	});
};

const parseErrorMessage = (value: string) => {
	try {
		JSON.parse(value);
	} catch (error) {
		return (error as Error).message;
	}

	throw new Error('Expected JSON.parse to reject the test value.');
};

const dropFile = (contents: string, fileName: string, mimeType: string) => {
	cy.get('[aria-label="CSV file dropzone"]').selectFile({
		contents: Cypress.Buffer.from(contents),
		fileName,
		mimeType,
	}, {
		action: 'drag-drop',
	});
};

describe('JSON formatter', () => {
	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/jsonformatter');
		cy.get('astro-island[component-export="JsonFormatterRoot"]').should('not.have.attr', 'ssr');
		sourceCodeEditor().should('be.visible');
	});

	it('hydrates with editable JSON source and read-only JSON output', () => {
		sourceCodeEditor()
			.should('have.attr', 'contenteditable', 'true')
			.and('not.have.attr', 'aria-readonly');
		outputCodeEditor('JSON')
			.should('be.visible')
			.and('have.attr', 'aria-readonly', 'true');
		cy.contains('label', 'Transform to').parent().find('button').should('contain.text', 'JSON');
		downloadButton().should('be.enabled');
		errorBanner().should('have.class', 'opacity-0');
	});

	it('updates the formatted output after editing valid JSON', () => {
		const value = {
			name: 'Ada',
			active: true,
			skills: ['math', 'programming'],
		};

		setSourceJson(value);
		expectJsonOutput(value, 2);
	});

	it('reports a source parse error, preserves output and recovers after correction', () => {
		const validValue = { name: 'Ada' };
		const typedInvalidJson = '{"name":';
		const invalidJson = '{"name":}';
		const expectedError = parseErrorMessage(invalidJson);

		setSourceJson(validValue);
		expectJsonOutput(validValue, 2);

		sourceCodeEditor()
			.clear()
			.type(typedInvalidJson, { parseSpecialCharSequences: false })
			.should(($editor) => {
				expect(codeEditorValue($editor)).to.equal(invalidJson);
			});

		errorBanner()
			.should('be.visible')
			.and('contain.text', 'Error')
			.and('contain.text', expectedError)
			.and('not.contain.text', 'Unknown error');
		downloadButton().should('be.disabled');
		expectJsonOutput(validValue, 2);

		const correctedValue = { name: 'Grace', active: true };

		setSourceJson(correctedValue);
		expectJsonOutput(correctedValue, 2);
		errorBanner().should('have.class', 'opacity-0');
		downloadButton().should('be.enabled');
	});

	it('switches between compact and beautified JSON with each tab count', () => {
		const value = { outer: { value: 1 } };

		setSourceJson(value);
		expectJsonOutput(value, 2);

		cy.contains('button', 'Compact').click();
		expectJsonOutput(value);

		cy.contains('button', 'Beautified').click();
		for (const tabCount of ([1, 2, 3] as const)) {
			selectTabCount(tabCount);
			expectJsonOutput(value, tabCount);
		}
	});

	it('converts JSON source to XML and CSV', () => {
		const xmlValue = { person: { name: 'Ada', age: 37 } };

		setSourceJson(xmlValue);
		expectJsonOutput(xmlValue, 2);
		selectTransform('XML');
		outputCodeEditor('XML')
			.should(($editor) => {
				const output = codeEditorValue($editor);

				expect(output).to.contain('<person>');
				expect(output).to.contain('<name>Ada</name>');
				expect(output).to.contain('<age>37</age>');
			});

		const csvValue = [
			{ name: 'Ada', age: 37 },
			{ name: 'Linus', age: 54 },
		];

		setSourceJson(csvValue);
		outputCodeEditor('XML').should(($editor) => {
			expect(codeEditorValue($editor)).to.contain('<name>Linus</name>');
		});
		selectTransform('CSV');
		rawOutputEditor().should(($textarea) => {
			expect(($textarea.val() as string).replaceAll('\r\n', '\n'))
				.to.equal('name,age\nAda,37\nLinus,54');
		});
		cy.contains('button', 'Compact').should('not.exist');
		cy.contains('label', 'JSON tabs').should('not.exist');
	});

	it('supports Code, Raw and Tree views and falls back for unsupported formats', () => {
		const value = { person: { name: 'Ada' } };

		setSourceJson(value);
		expectJsonOutput(value, 2);

		outputViewButton('Raw').click();
		rawOutputEditor().should('have.value', JSON.stringify(value, null, 2));

		outputViewButton('Tree').click();
		cy.get('button[aria-label="Collapse JSON node"]').should('exist');
		outputCodeEditor('JSON').should('not.exist');

		selectTransform('XML');
		outputCodeEditor('XML').should('exist');

		outputViewButton('Raw').click();
		rawOutputEditor().should('contain.value', '<person>');
		selectTransform('CSV');
		rawOutputEditor().should('exist');
		outputViewButton('Code').should('have.attr', 'aria-disabled', 'true');
		outputViewButton('Tree').should('have.attr', 'aria-disabled', 'true');
	});

	it('loads JSON, CSV and XML files through drag and drop', () => {
		dropFile('{"person":{"name":"Ada"}}', 'person.json', 'application/json');
		expectJsonOutput({ person: { name: 'Ada' } }, 2);

		dropFile('name,age\nAda,37', 'people.csv', 'text/csv');
		expectJsonOutput([
			['name', 'age'],
			['Ada', '37'],
		], 2);

		dropFile('<person><name>Grace</name></person>', 'person.xml', 'application/xml');
		expectJsonOutput({ person: { name: 'Grace' } }, 2);
	});

	it('reports an invalid dropped file without replacing valid data', () => {
		const validValue = { name: 'Ada' };
		const invalidJson = '{"name":';

		setSourceJson(validValue);
		expectJsonOutput(validValue, 2);
		dropFile(invalidJson, 'broken.json', 'application/json');

		errorBanner()
			.should('be.visible')
			.and('contain.text', parseErrorMessage(invalidJson));
		downloadButton().should('be.disabled');
		expectJsonOutput(validValue, 2);
	});

	it('downloads JSON, XML and CSV with the expected names and contents', () => {
		const objectValue = { person: { name: 'Ada', age: 37 } };

		setSourceJson(objectValue);
		expectJsonOutput(objectValue, 2);
		downloadButton().click();
		cy.readFile('cypress/downloads/result_JSON.json', null).should((content: typeof Cypress.Buffer) => {
			expect(content.toString()).to.equal(JSON.stringify(objectValue, null, 2));
		});

		selectTransform('XML');
		outputCodeEditor('XML').should(($editor) => {
			expect(codeEditorValue($editor)).to.contain('<name>Ada</name>');
		});
		downloadButton().click();
		cy.readFile('cypress/downloads/result_XML.xml')
			.should('contain', '<person>')
			.and('contain', '<name>Ada</name>')
			.and('contain', '<age>37</age>');

		const csvValue = [
			{ name: 'Ada', age: 37 },
			{ name: 'Linus', age: 54 },
		];

		setSourceJson(csvValue);
		outputCodeEditor('XML').should(($editor) => {
			expect(codeEditorValue($editor)).to.contain('<name>Linus</name>');
		});
		selectTransform('CSV');
		rawOutputEditor().should('contain.value', 'Linus,54');
		downloadButton().click();
		cy.readFile('cypress/downloads/result_CSV.csv').should((content: string) => {
			expect(content.replaceAll('\r\n', '\n')).to.equal('name,age\nAda,37\nLinus,54');
		});
	});
});

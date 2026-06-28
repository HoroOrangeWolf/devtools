/// <reference types="cypress" />

type HashCase = {
	algorithm: string;
	expected: string;
	type: 'plain' | 'bcrypt' | 'argon';
};

type OptionCase = {
	name: string;
	field: string;
	value: string;
	expected: string;
};

const content = 'abc';
const salt = '1234567890abcdef';
const otherSalt = 'abcdef1234567890';

const hashCases: HashCase[] = [
	{
		algorithm: 'SHA-224',
		expected: '23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7',
		type: 'plain',
	},
	{
		algorithm: 'SHA-256',
		expected: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
		type: 'plain',
	},
	{
		algorithm: 'SHA-384',
		expected: 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7',
		type: 'plain',
	},
	{
		algorithm: 'SHA-512',
		expected: 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
		type: 'plain',
	},
	{
		algorithm: 'SHA3-224',
		expected: 'e642824c3f8cf24ad09234ee7d3c766fc9a3a5168d0c94ad73b46fdf',
		type: 'plain',
	},
	{
		algorithm: 'SHA3-256',
		expected: '3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532',
		type: 'plain',
	},
	{
		algorithm: 'SHA3-384',
		expected: 'ec01498288516fc926459f58e2c6ad8df9b473cb0fc08c2596da7cf0e49be4b298d88cea927ac7f539f1edf228376d25',
		type: 'plain',
	},
	{
		algorithm: 'SHA3-512',
		expected: 'b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0',
		type: 'plain',
	},
	{
		algorithm: 'MD5',
		expected: '900150983cd24fb0d6963f7d28e17f72',
		type: 'plain',
	},
	{
		algorithm: 'BCRYPT',
		expected: '$2a$04$KRGxLBS0Lxe3KEDgW0PjXeWgMSyadRZR7fl8cxJQPbH0NOXcCrGQW',
		type: 'bcrypt',
	},
	{
		algorithm: 'ARGON2D',
		expected: 'ab90e23808a785a2c4e288fb6ce4e5bf',
		type: 'argon',
	},
	{
		algorithm: 'ARGON2I',
		expected: 'ba61f5886a544da96301122c68e05010',
		type: 'argon',
	},
	{
		algorithm: 'ARGON2ID',
		expected: 'c906bf25d5450ab212f9b63e46614109',
		type: 'argon',
	},
];

const argonOptionCases: OptionCase[] = [
	{
		name: 'hash length',
		field: 'Hash Length',
		value: '24',
		expected: '08cacbbaeffd298824aa1adb598eef3dccf458bb334e14be',
	},
	{
		name: 'iterations',
		field: 'Iterations',
		value: '2',
		expected: '948048358c0cca81167a6e3839247393',
	},
	{
		name: 'memory size',
		field: 'Memory Size',
		value: '32',
		expected: 'ef7c7f23cd1f8e4a1f5218cad7829623',
	},
	{
		name: 'parallelism',
		field: 'Parallelism',
		value: '2',
		expected: 'd7e8323c5bd76596aa1d89416fbf9f96',
	},
	{
		name: 'salt',
		field: 'Salt',
		value: otherSalt,
		expected: '3c8c601da5ed3425bd57a279e428f8e8',
	},
];

const sourceContent = () => cy.get('textarea[placeholder="Type or drop file here..."]');
const hashResult = () => cy.get('textarea[placeholder="Result..."]');

const setField = (label: string, value: string) => {
	cy.contains('label', label).parent().find('input').type(`{selectall}${value}`);
};

const selectAlgorithm = (algorithm: string) => {
	cy.get('[role="combobox"]').then(($select) => {
		if ($select.text().trim() === algorithm) {
			return;
		}

		cy.wrap($select).click();
		cy.contains('[role="option"]', algorithm).click();
	});
};

describe('Hash generator page', () => {
	beforeEach(() => {
		cy.task('clearDownloads');
		cy.visit('/hash');
		cy.get('[data-ishydrated="true"]').should('exist');
	});

	for (const { algorithm, expected, type } of hashCases) {
		it(`generates the expected ${algorithm} hash`, () => {
			cy.contains('h2', 'Hash Generator').should('be.visible');
			sourceContent().type(content);

			selectAlgorithm(algorithm);

			if (type === 'bcrypt') {
				setField('Salt', salt);
			}

			if (type === 'argon') {
				setField('Salt', salt);
			}

			cy.contains('button', 'Generate').click();

			hashResult().should('have.value', expected);
		});
	}

	it('hashes content loaded with the upload button', () => {
		cy.window().then((window) => {
			const file = new window.File(['uploaded file content'], 'upload.txt', {
				type: 'text/plain',
			});

			cy.stub(window.HTMLInputElement.prototype, 'click').callsFake(function (this: HTMLInputElement) {
				// eslint-disable-next-line unicorn/no-this-outside-of-class
				Object.defineProperty(this, 'files', { value: [file] });
				// eslint-disable-next-line unicorn/no-this-outside-of-class
				this.dispatchEvent(new window.Event('change'));
			});
		});

		cy.contains('button', 'Upload').click();
		cy.contains('File has been loaded').should('be.visible');
		cy.contains('button', 'Generate').click();

		hashResult().should('have.value', '28656224237fb152ec1e4d20a3c9e063051bed4b6217a6e039c19ee1978a56fb');
	});

	it('hashes content loaded by dropping a file', () => {
		cy.get('[aria-label="CSV file dropzone"]').selectFile({
			contents: Cypress.Buffer.from('dropped file content'),
			fileName: 'drop.txt',
			mimeType: 'text/plain',
		}, {
			action: 'drag-drop',
		});

		cy.contains('File has been loaded').should('be.visible');
		cy.contains('button', 'Generate').click();

		hashResult().should('have.value', 'cfb2602438363471b33e3b5f7c37e3664f8b20fcc5bc453838f58097e2b78501');
	});

	it('downloads the generated hash', () => {
		sourceContent().type(content);
		cy.contains('button', 'Generate').click();
		hashResult().should('have.value', hashCases[1].expected);

		cy.contains('button', 'Download').click();

		cy.readFile('cypress/downloads/result_hash.txt').should('equal', hashCases[1].expected);
	});

	it('applies the bcrypt cost factor option', () => {
		sourceContent().type(content);
		selectAlgorithm('BCRYPT');
		setField('Cost Factor', '5');
		setField('Salt', salt);
		cy.contains('button', 'Generate').click();

		hashResult().should('have.value', '$2a$05$KRGxLBS0Lxe3KEDgW0PjXepkcIRAGlnS.2znpquW2faS6PbK6vffC');
	});

	it('applies the bcrypt salt option', () => {
		sourceContent().type(content);
		selectAlgorithm('BCRYPT');
		setField('Salt', otherSalt);
		cy.contains('button', 'Generate').click();

		hashResult().should('have.value', '$2a$04$WUHhXETkKRGxLBS0Lxe3K.D3hILMr5PEzv53S0dztl/Xeb6vqL5xS');
	});

	for (const { name, field, value, expected } of argonOptionCases) {
		it(`applies the Argon2 ${name} option`, () => {
			sourceContent().type(content);
			selectAlgorithm('ARGON2ID');
			setField('Salt', salt);
			setField(field, value);
			cy.contains('button', 'Generate').click();

			hashResult().should('have.value', expected);
		});
	}
});

/// <reference types="cypress" />

type HashCase = {
	algorithm: string;
	expected: string;
	type: 'plain' | 'bcrypt' | 'argon';
};

const content = 'abc';
const salt = '1234567890abcdef';

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

const sourceContent = () => cy.get('textarea[placeholder="Type or drop file here..."]');
const hashResult = () => cy.get('textarea[placeholder="Result..."]');

const setField = (label: string, value: string) => {
	cy.contains('label', label).parent().find('input').clear().type(value);
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
});

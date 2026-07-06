/// <reference types="cypress" />

import { JWT_ALGORITHM_FIXTURES } from '@/container/jwt/fixture/jwtAlgorithm.fixture.ts';

const algorithmSelect = () => cy.get('[aria-label="JWT signing algorithm"]');
const signedJwt = () => cy.get('.cm-content[aria-label="Signed JWT"]');
const secret = () => cy.contains('label', 'Secret / Private Key').parent().find('textarea');
const decoderJwt = () => cy.get('.cm-content[aria-label="Encoded JWT"]');
const decoderSecret = () => cy.contains('label', /^Secret$/).parent().find('textarea');

const decodeJwtPart = (token: string, index: 0 | 1) => {
	const encodedPart = token.split('.', 3)[index].replaceAll('-', '+').replaceAll('_', '/');
	const paddedPart = encodedPart.padEnd(Math.ceil(encodedPart.length / 4) * 4, '=');

	return JSON.parse(globalThis.atob(paddedPart));
};

const selectAlgorithm = (algorithm: string) => {
	algorithmSelect().click();
	cy.contains('[role="option"]', algorithm).click();
};

const editHeaderAlgorithm = (algorithm: string) => {
	cy.contains('label', 'JWT Header')
		.parent()
		.within(() => {
			cy.contains(/^"(?:HS256|ES256)"$/).dblclick();
			cy.get('input[aria-label="string value"]').clear().type(algorithm).blur();
		});
};

const editTreeString = (fieldLabel: string, currentValue: string, nextValue: string) => {
	cy.contains('label', fieldLabel)
		.parent()
		.within(() => {
			cy.contains(JSON.stringify(currentValue)).dblclick();
			cy.get('input[aria-label="string value"]')
				.clear()
				.type(nextValue, { parseSpecialCharSequences: false })
				.blur();
		});
};

const setEditorValue = (editor: Cypress.Chainable<JQuery<HTMLElement>>, value: string) => {
	editor.click().type('{selectAll}').type(value, { parseSpecialCharSequences: false });
};

describe('JWT encoder', () => {
	beforeEach(() => {
		cy.visit('/jwt');
		cy.get('[data-ishydrated="true"]').should('exist');
		cy.contains('button', 'Encoder').click();
	});

	it('exposes every supported signing algorithm', () => {
		algorithmSelect().click();

		for (const { algorithm } of JWT_ALGORITHM_FIXTURES) {
			cy.contains('[role="option"]', algorithm).should('be.visible');
		}
	});

	for (const { algorithm } of JWT_ALGORITHM_FIXTURES) {
		it(`signs a JWT using ${algorithm}`, () => {
			if (algorithm !== 'HS256') {
				selectAlgorithm(algorithm);
			}

			signedJwt()
				.should('not.have.text', '')
				.then(($editor) => {
					const header = decodeJwtPart($editor.text(), 0);

					expect(header.alg).to.equal(algorithm);
				});
			cy.contains('JWT has been signed').should('be.visible');
		});
	}

	it('updates the header and key when the select changes', () => {
		selectAlgorithm('RS256');

		algorithmSelect().should('contain.text', 'RS256');
		secret().should('contain.value', '-----BEGIN PRIVATE KEY-----');
		signedJwt().should(($editor) => {
			expect(decodeJwtPart($editor.text(), 0).alg).to.equal('RS256');
		});
	});

	it('updates the signed payload after editing a claim', () => {
		editTreeString('JWT Payload', 'John Doe', 'Ada Lovelace');

		signedJwt().should(($editor) => {
			const payload = decodeJwtPart($editor.text(), 1);

			expect(payload.name).to.equal('Ada Lovelace');
			expect(payload.roles).to.deep.equal(['user']);
		});
		cy.contains('JWT has been signed').should('be.visible');
	});

	it('creates a new signature when the secret changes', () => {
		let originalToken = '';

		signedJwt()
			.invoke('text')
			.then((value) => {
				originalToken = value as string;
			});
		secret().clear().type('a-different-secret-with-at-least-32-bytes');

		signedJwt().should(($editor) => {
			const nextToken = $editor.text();
			const originalParts = originalToken.split('.');
			const nextParts = nextToken.split('.');

			expect(nextToken).not.to.equal(originalToken);
			expect(nextParts.slice(0, 2)).to.deep.equal(originalParts.slice(0, 2));
			expect(nextParts[2]).not.to.equal(originalParts[2]);
		});
	});

	it('updates the select and key when the header changes manually', () => {
		editHeaderAlgorithm('ES256');

		algorithmSelect().should('contain.text', 'ES256');
		secret().should('contain.value', '-----BEGIN PRIVATE KEY-----');
		cy.contains('JWT has been signed').should('be.visible');
	});

	it('keeps an unsupported manual algorithm and shows a signing error', () => {
		editHeaderAlgorithm('unsupported');

		algorithmSelect().should('contain.text', 'Unsupported algorithm');
		cy.contains('Failed to sign key').should('be.visible');
	});
});

describe('JWT decoder', () => {
	beforeEach(() => {
		cy.visit('/jwt');
		cy.get('[data-ishydrated="true"]').should('exist');
	});

	it('colors each part of the encoded token', () => {
		decoderJwt().within(() => {
			cy.get('.cm-jwt-header').should('exist');
			cy.get('.cm-jwt-payload').should('exist');
			cy.get('.cm-jwt-signature').should('exist');
		});
	});

	it('decodes the header and payload independently of signature verification', () => {
		decoderSecret().clear().type('incorrect-secret');

		cy.contains('label', 'Decoded Header')
			.parent()
			.should('contain.text', 'alg')
			.and('contain.text', 'HS256');
		cy.contains('label', 'Decoded Payload')
			.parent()
			.should('contain.text', 'John Doe')
			.and('contain.text', 'john.doe@example.com')
			.and('contain.text', 'user');
		cy.get('[role="alert"]')
			.should('contain.text', 'Error')
			.and('contain.text', 'Failed to parse JSON');
	});

	it('verifies an encoded token and rejects a tampered signature', () => {
		let token = '';

		cy.contains('button', 'Encoder').click();
		signedJwt()
			.should('not.have.text', '')
			.invoke('text')
			.then((value) => {
				token = value as string;
			});
		cy.contains('button', 'Decoder').click();
		setEditorValue(decoderJwt(), token);
		cy.get('[role="alert"]').should('contain.text', 'Error');
		decoderSecret().clear().type(JWT_ALGORITHM_FIXTURES[0].secret);
		cy.get('[role="alert"]')
			.should('contain.text', 'Success')
			.and('contain.text', 'JWT is valid');

		const parts = token.split('.');
		parts[2] = `${parts[2][0] === 'A' ? 'B' : 'A'}${parts[2].slice(1)}`;
		setEditorValue(decoderJwt(), parts.join('.'));
		cy.get('[role="alert"]')
			.should('contain.text', 'Error')
			.and('contain.text', 'Failed to parse JSON');
	});

	it('shows an error for a malformed token', () => {
		setEditorValue(decoderJwt(), 'not-a-jwt');

		cy.get('[role="alert"]')
			.should('contain.text', 'Error')
			.and('contain.text', 'Failed to parse JSON');
	});
});

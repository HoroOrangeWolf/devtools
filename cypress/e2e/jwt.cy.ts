/// <reference types="cypress" />

import { JWT_ALGORITHM_FIXTURES } from '@/container/jwt/fixture/jwtAlgorithm.fixture.ts';

const algorithmSelect = () => cy.get('[aria-label="JWT signing algorithm"]');
const signedJwt = () => cy.get('textarea[placeholder="Signed JWT"]');
const secret = () => cy.contains('label', 'Secret / Private Key').parent().find('textarea');

const decodeProtectedHeader = (token: string) => {
	const encodedHeader = token.split('.',3)[0].replaceAll('-', '+').replaceAll('_', '/');
	const paddedHeader = encodedHeader.padEnd(Math.ceil(encodedHeader.length / 4) * 4, '=');

	return JSON.parse(globalThis.atob(paddedHeader));
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

describe('JWT encoder algorithms', () => {
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
				.should('not.have.value', '')
				.then(($textarea) => {
					const header = decodeProtectedHeader($textarea.val() as string);

					expect(header.alg).to.equal(algorithm);
				});
			cy.contains('JWT has been signed').should('be.visible');
		});
	}

	it('updates the header and key when the select changes', () => {
		selectAlgorithm('RS256');

		algorithmSelect().should('contain.text', 'RS256');
		secret().should('contain.value', '-----BEGIN PRIVATE KEY-----');
		signedJwt().should(($textarea) => {
			expect(decodeProtectedHeader($textarea.val() as string).alg).to.equal('RS256');
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

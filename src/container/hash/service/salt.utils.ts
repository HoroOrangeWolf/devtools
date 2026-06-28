
const generateSalt = (length: number) => {
	const ranValues = crypto.getRandomValues(new Uint8Array(length));

	return Array.from(ranValues, byte =>
		byte.toString(16).padStart(2, '0')
	).join('');
};

export const SaltUtils = {
	generateSalt
};
import { defineConfig } from 'cypress';
import { rmSync } from 'node:fs';

export default defineConfig({
	downloadsFolder: 'cypress/downloads',
	e2e: {
		baseUrl: 'http://localhost:4321',
		supportFile: false,
		setupNodeEvents(on, config) {
			on('task', {
				clearDownloads() {
					rmSync(config.downloadsFolder, {
						force: true,
						recursive: true,
					});

					return null;
				},
			});
		},
	}
});

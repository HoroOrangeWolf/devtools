export const NavItems = [
	{
		href: '/uuid',
		label: 'UUID',
		description: 'Generate UUID values',
		isReady: true,
	},
	{
		href: '/csv',
		label: 'CSV',
		description: 'Format and export data',
		isReady: true,
	},
	{
		href: '/base',
		label: 'Base64',
		description: 'Encode and decode Base64',
		isReady: true,
	},
	{
		href: '#',
		label: 'JSON',
		description: 'Inspect and transform JSON',
		isReady: false,
	},
	{
		href: '#',
		label: 'Hash',
		description: 'Create checksums',
		isReady: false,
	},
] as const;
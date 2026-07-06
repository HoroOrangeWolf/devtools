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
		href: '/jsonformatter',
		label: 'JSON',
		description: 'Format and beautify JSON',
		isReady: true,
	},
	{
		href: '/hash',
		label: 'Hash',
		description: 'Create checksums',
		isReady: true,
	},
	{
		href: '/pdf',
		label: 'PDF',
		description: 'Manage PDF',
		isReady: true,
	},
	{
		href: '/jwt',
		label: 'JWT',
		description: 'Debug and view JWT',
		isReady: true,
	},
	{
		href: '/cron',
		label: 'Cron',
		isReady: true,
		description: 'Create and describe CRON',
	},
	{
		href: '/lorem',
		label: 'Lorem',
		isReady: false
	},
	{
		href: '/markdown',
		label: 'Markdown Editor',
		isReady: false
	},
	{
		href: '/color',
		label: 'Color Palette',
		isReady: false,
	},
	{
		href: '/urlParser',
		label: 'URL Parser',
		isReady: false,
	},
	{
		href: '/unixTimestamp',
		label: 'Unix Timestamp Converter',
		isReady: false,
	}
] as const;
// TODO: Poprawić tree view do jsona bo nie działa
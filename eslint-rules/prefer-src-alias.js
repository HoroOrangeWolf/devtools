import path from 'node:path';

const srcRoot = path.resolve(process.cwd(), 'src');

const toPosixPath = (value) => value.split(path.sep).join('/');

const getAliasPath = (filename, importPath) => {
	if (importPath.startsWith('src/')) {
		return `@/${importPath.slice('src/'.length)}`;
	}

	if (!importPath.startsWith('.')) {
		return undefined;
	}

	const absoluteImportPath = path.resolve(path.dirname(filename), importPath);
	const relativeToSrc = path.relative(srcRoot, absoluteImportPath);

	if (relativeToSrc.startsWith('..') || path.isAbsolute(relativeToSrc)) {
		return undefined;
	}

	return `@/${toPosixPath(relativeToSrc)}`;
};

const checkSource = (context, node) => {
	if (!node.source || typeof node.source.value !== 'string') {
		return;
	}

	const aliasPath = getAliasPath(context.filename, node.source.value);

	if (!aliasPath || aliasPath === node.source.value) {
		return;
	}

	context.report({
		node: node.source,
		message: 'Use the @/ alias for imports from src.',
		fix(fixer) {
			const quote = node.source.raw?.startsWith('"') ? '"' : "'";

			return fixer.replaceText(node.source, `${quote}${aliasPath}${quote}`);
		},
	});
};

export default {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		docs: {
			description: 'Prefer the @/ alias for imports from src.',
		},
		schema: [],
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				checkSource(context, node);
			},
			ExportAllDeclaration(node) {
				checkSource(context, node);
			},
			ExportNamedDeclaration(node) {
				checkSource(context, node);
			},
		};
	},
};

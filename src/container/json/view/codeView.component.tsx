import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';

type PropsType = {
    type: ViewDataType;
    children: string | string[];
}

const getLanguage = (type: ViewDataType) => {
	switch (type) {
		case ViewDataTypeConstant.JSON: {
			return 'json';
		}
		case ViewDataTypeConstant.XML: {
			return 'xml';
		}
	}
};

export const CodeView = ({ type, children }:PropsType) => (
	<SyntaxHighlighter language={getLanguage(type)}>
		{children}
	</SyntaxHighlighter>
);

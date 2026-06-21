import { ViewDataType, ViewDataTypeConstant } from '@/container/json/constant/viewDataType.constant.ts';
import { ContentFormat } from '@/service/file.service.ts';

export const FileDataTypeExtensionMapConstant: Record<ViewDataType, ContentFormat> = {
	[ViewDataTypeConstant.JSON]: 'application/json',
	[ViewDataTypeConstant.XML]: 'application/xml',
	[ViewDataTypeConstant.CSV]: 'text/csv',
} as const;
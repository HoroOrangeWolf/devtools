import { ToastUtils } from '@/utils/toast.utils.ts';

type PropsType = {
    text: string | number,
    children: React.ReactNode,
}

export const ClipboardWrapper = ({ children, text }: PropsType) => {
	const handleOnClick = async () => {
		try {
			await navigator.clipboard.writeText(`${text}`);
			ToastUtils.info('Text has been copied to clipboard');
		} catch (error) {
			console.error('Failed to copy to clipboard', error);
			ToastUtils.info('Failed to copy to clipboard');
		}
	};

	return (
		<span
			onClick={handleOnClick}
		>
			{children}
		</span>
	);
};
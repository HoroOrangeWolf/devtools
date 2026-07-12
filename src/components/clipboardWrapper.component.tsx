import { ToastUtils } from '@/utils/toast.utils.ts';
import { Button } from '@/components/ui/button.tsx';
import { ClipboardCopy } from 'lucide-react';

type PropsType = {
    text: string | number,
	displayButton?: boolean,
    children: React.ReactNode,
}

export const ClipboardWrapper = ({ children, text, displayButton }: PropsType) => {
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
			onClick={displayButton ? undefined : handleOnClick}
		>
			{children}
			{displayButton && (
				<Button
					variant="ghost"
					onClick={handleOnClick}
				>
					<ClipboardCopy />
				</Button>
			)}
		</span>
	);
};
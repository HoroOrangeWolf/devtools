
import { toast } from 'sonner';

export const ToastUtils = {
	info: (description: string) => toast.info('Info', { description }),
	error: (description: string) => toast.error('Error', { description }),
};
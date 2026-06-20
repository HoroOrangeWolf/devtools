import { Toaster } from '@/components/ui/sonner.tsx';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';

type PropsType = {
    children?: React.ReactNode | React.ReactNode[]
}

export const PageWrapper = ({ children }: PropsType) => (
	<>
		<Toaster />
		<TooltipProvider>
			{children}
		</TooltipProvider>
	</>
);
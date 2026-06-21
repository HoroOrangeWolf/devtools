import { Toaster } from '@/components/ui/sonner.tsx';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { HydratedMarker } from '@/components/hydratedMarker.component.tsx';

type PropsType = {
    children?: React.ReactNode | React.ReactNode[]
}

export const PageWrapper = ({ children }: PropsType) => (
	<>
		<Toaster />
		<HydratedMarker />
		<TooltipProvider>
			{children}
		</TooltipProvider>
	</>
);
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

type PropsType = {
    tooltip?: React.ReactNode;
    children: React.ReactElement;
}

export const TooltipWrapper = ({ children, tooltip }: PropsType)=> (
	<Tooltip>
		<TooltipTrigger asChild>{children}</TooltipTrigger>
		<TooltipContent>{tooltip}</TooltipContent>
	</Tooltip>
);

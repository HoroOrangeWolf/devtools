import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

const Dialog = (props: React.ComponentProps<typeof DialogPrimitive.Root>) => (
	<DialogPrimitive.Root data-slot="dialog" {...props} />
);

const DialogClose = (props: React.ComponentProps<typeof DialogPrimitive.Close>) => (
	<DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

const DialogPortal = (props: React.ComponentProps<typeof DialogPrimitive.Portal>) => (
	<DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
);

const DialogOverlay = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
	<DialogPrimitive.Overlay
		data-slot="dialog-overlay"
		className={cn('fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)}
		{...props}
	/>
);

const DialogContent = ({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
}) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			data-slot="dialog-content"
			className={cn('fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95', className)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close
					className="absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
				>
					<XIcon />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			)}
		</DialogPrimitive.Content>
	</DialogPortal>
);

const DialogHeader = ({ className, ...props }: React.ComponentProps<'div'>) => (
	<div
		data-slot="dialog-header"
		className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
		{...props}
	/>
);

const DialogFooter = ({ className, ...props }: React.ComponentProps<'div'>) => (
	<div
		data-slot="dialog-footer"
		className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
		{...props}
	/>
);

const DialogTitle = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) => (
	<DialogPrimitive.Title
		data-slot="dialog-title"
		className={cn('text-lg leading-none font-semibold', className)}
		{...props}
	/>
);

const DialogDescription = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) => (
	<DialogPrimitive.Description
		data-slot="dialog-description"
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
);

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
};

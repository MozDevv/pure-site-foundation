import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, children, ...props }, ref) => {
  // Get the initials from children if provided
  const initials =
    React.Children.toArray(children).join('').slice(0, 2) || 'US';

  // Enhanced color generation based on hash of initials
  const colorScheme = (() => {
    // Create a simple hash from the initials
    const hash = Array.from(initials).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );

    // Modern chat app color palette
    const colors = [
      { bg: 'bg-blue-500', text: 'text-white' }, // Blue
      { bg: 'bg-blue-500', text: 'text-white' }, // Blue
      { bg: 'bg-fuchsia-500', text: 'text-white' }, // Fuchsia
      { bg: 'bg-rose-500', text: 'text-white' }, // Rose
      { bg: 'bg-amber-500', text: 'text-gray-900' }, // Amber (darker text)
      { bg: 'bg-emerald-500', text: 'text-white' }, // Emerald
      { bg: 'bg-blue-500', text: 'text-white' }, // Blue
      { bg: 'bg-cyan-500', text: 'text-gray-900' }, // Cyan (darker text)
    ];

    // Select color based on hash
    return colors[hash % colors.length];
  })();

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full',
        'text-sm font-medium select-none',
        'uppercase tracking-wide', // Slightly tighter letter spacing
        colorScheme.bg,
        colorScheme.text,
        className
      )}
      {...props}
    >
      {initials}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };

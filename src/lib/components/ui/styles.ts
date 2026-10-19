export type ButtonVariant = 'primary' | 'secondary' | 'overlay' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export const tooltipClasses =
	'rounded-lg border border-slate-200/80 bg-[#fbfaf7] px-3 py-2 text-sm font-medium leading-snug text-slate-800 shadow-sm';

const buttonVariants: Record<ButtonVariant, string> = {
	primary: 'border-transparent bg-brand text-slate-950 hover:bg-brand/90',
	secondary: 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50',
	overlay: 'border-white/60 bg-slate-950/50 text-white hover:bg-slate-950/70 focus-visible:outline-white',
	ghost: 'border-transparent bg-transparent text-slate-800 hover:bg-slate-100',
};

const buttonSizes: Record<ButtonSize, string> = {
	sm: 'min-h-11 px-4 py-2 text-xs sm:text-sm',
	md: 'min-h-11 px-5 py-2.5 text-sm',
	lg: 'min-h-12 px-6 py-3 text-sm sm:text-base',
	icon: 'h-11 w-11 shrink-0 p-2.5',
};

export const buttonClasses = (variant: ButtonVariant, size: ButtonSize, className = '') =>
	`inline-flex items-center justify-center gap-2 rounded-xl border font-semibold leading-snug text-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none [&_svg]:shrink-0 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`;

export type CardTone = 'default' | 'muted' | 'accent' | 'quiet';
export type CardPadding = 'none' | 'sm' | 'compact' | 'md' | 'lg';

const cardTones: Record<CardTone, string> = {
	default: 'border-slate-200 bg-white',
	muted: 'border-slate-200 bg-slate-50',
	accent: 'border-brand/25 bg-brand/5',
	quiet: 'border-slate-200/70 bg-white',
};

const cardPaddings: Record<CardPadding, string> = {
	none: '',
	sm: 'p-4 sm:p-5',
	compact: 'p-6',
	md: 'p-6 sm:p-8',
	lg: 'p-6 sm:p-10 lg:p-12',
};

export const cardClasses = (tone: CardTone, padding: CardPadding, interactive = false, className = '') =>
	`${tone === 'quiet' ? 'rounded-xl' : 'rounded-2xl'} border ${cardTones[tone]} ${cardPaddings[padding]} ${interactive ? 'text-left transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900 motion-reduce:transition-none' : ''} ${className}`;

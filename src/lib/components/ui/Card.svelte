<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cardClasses, type CardPadding, type CardTone } from './styles';

	type Props = HTMLAttributes<HTMLElement> & {
		children: Snippet;
		as?: 'div' | 'section' | 'article';
		tone?: CardTone;
		padding?: CardPadding;
	};

	let { children, as = 'div', tone = 'default', padding = 'md', class: className = '', ...rest }: Props = $props();
</script>

<svelte:element this={as} {...rest} class={[cardClasses(tone, padding), className]}>
	{@render children()}
</svelte:element>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cardClasses, type CardPadding, type CardTone } from './styles';

	type Props = HTMLAnchorAttributes & {
		href: string;
		children: Snippet;
		tone?: CardTone;
		padding?: CardPadding;
	};

	let { children, href, tone = 'default', padding = 'md', class: className = '', ...rest }: Props = $props();
</script>

<a {...rest} {href} class={[cardClasses(tone, padding, true), className]}>
	{@render children()}
</a>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cardClasses, type CardPadding, type CardTone } from './styles';

	type Props = HTMLButtonAttributes & {
		children: Snippet;
		tone?: CardTone;
		padding?: CardPadding;
	};

	let { children, tone = 'default', padding = 'md', type = 'button', class: className = '', ...rest }: Props = $props();
</script>

<button {...rest} {type} class={[cardClasses(tone, padding, true), 'disabled:pointer-events-none disabled:opacity-50', className]}>
	{@render children()}
</button>

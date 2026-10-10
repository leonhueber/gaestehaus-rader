<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { buttonClasses, type ButtonSize, type ButtonVariant } from './styles';

	type Props = HTMLAnchorAttributes & {
		href: string;
		children: Snippet;
		element?: HTMLAnchorElement | null;
		variant?: ButtonVariant;
		size?: Exclude<ButtonSize, 'icon'>;
	};

	let { element = $bindable(null), children, href, variant = 'primary', size = 'md', class: className = '', ...rest }: Props = $props();
</script>

<a bind:this={element} {...rest} {href} class={[buttonClasses(variant, size), className]}>
	{@render children()}
</a>

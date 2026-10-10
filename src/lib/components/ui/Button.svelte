<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { buttonClasses, type ButtonSize, type ButtonVariant } from './styles';

	type Props = HTMLButtonAttributes & {
		children: Snippet;
		element?: HTMLButtonElement | null;
		variant?: ButtonVariant;
		size?: ButtonSize;
	};

	let { element = $bindable(null), children, variant = 'primary', size = 'md', type = 'button', class: className = '', ...rest }: Props = $props();
</script>

<button bind:this={element} {...rest} {type} class={[buttonClasses(variant, size), className]}>
	{@render children()}
</button>

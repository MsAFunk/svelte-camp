<script>
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();
    
    export let items;
    export let activeItem;
</script>

<style>
    .tabs ul {margin:0 auto 20px; padding:0; list-style: none; text-align:center;}
        .tabs li {display:inline-block; padding:10px; line-height: 40px; cursor:pointer;color:hsl(25, 80%, 55%)}
        .tabs li:hover {color:hsl(25, 80%, 75%)}
    .active {color:hsl(330, 60%, 55%); border-bottom:2px hsl(330, 60%, 55%) solid;}
</style>

<div class="tabs">
    <ul>
        {#each items as item}
        <li on:click={() => dispatch('tabChange', item)}> <!-- On Click, run an inline function to dispatch a custom event with item as the data-->
            <div class:active={item === activeItem}>{item}</div>
        </li>
        {/each}
    </ul>
</div>
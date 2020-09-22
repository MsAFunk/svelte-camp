<script>
    import {fade, scale } from 'svelte/transition';
    import {flip} from 'svelte/animate';
    
    //import { onMount, onDestroy } from 'svelte'; /* Only needed if using the subscribe method */
    import PollStore from '../stores/PollStore.js';
    import PollDetails from './PollDetails.svelte';
   

    /* Subscribing to PollStore, setting the polls array to the data from the store, unsubscribing when the component is destroyed */

    // export let polls = []; 
    // const unsub = PollStore.subscribe(data => {
    //     polls = data;
    // });
    // onDestroy(() => { unsub(); });

</script>

<style>
    .poll-list {display:grid; grid-template-columns:1fr 1fr; grid-gap:20px;}
    
</style>

<div class="poll-list"> <!--Changed polls as poll() to $PollStore to automatically subscribe to the data in PollStore-->
    {#each $PollStore as poll (poll.id)} 
    <div in:fade out:scale|local animate:flip={{duration:500}}>
        <PollDetails {poll} />
    </div>     
    {/each}

</div>
<script> 
    
    export let poll;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //reactive values
    $: totalVotes = poll.votesA + poll.votesB

   //handling votes
   const handleVote = (option, id) => {
        dispatch('vote', {option, id});
        console.log(option, id);
        
   };




</script>

<style>
    .poll h3 {font-size:16px; color:hsl(332, 100%, 50%)}
    .totalVotes {font-size:12px; color:hsl(0, 0%, 47%);}
    .option {margin:10px auto; padding: 5px 10px; background: hsl(0, 0%, 90%); border-radius:2px;}
        .option:hover {color:hsl(0, 0%, 20%); background: hsl(0, 0%, 93%); cursor:pointer }
</style>

<div class="poll">
    <h3>{poll.question}</h3>
    <span class="totalVotes">(total: {totalVotes})</span>
    <div class="option" on:click={() => handleVote('a', poll.id)}>
        <div class="percent percent-a"></div>
        <span>{poll.optionA} ({poll.votesA})</span>
        
    </div>
    <div class="option" on:click={() => handleVote('b', poll.id)}>
        <div class="percent percent-b"></div>
        <span>{poll.optionB} ({poll.votesB})</span>    
    </div>
    
</div>
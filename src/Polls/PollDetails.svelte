<script>
    import {fade, scale } from 'svelte/transition';
    import Card from '../shared/Card.svelte'; 
    import PollStore from '../stores/PollStore';
    import Button from '../shared/Button.svelte';
    export let poll;
    

    //reactive values
    $: totalVotes = poll.votesA + poll.votesB
    $: percentA = Math.floor(100 / totalVotes * poll.votesA)
    $: percentB = Math.floor(100 / totalVotes * poll.votesB)

   //handling votes
    const handleVote = (option, id) => {
        PollStore.update(currentPolls => {
            
            let copiedPolls = [...currentPolls];
            let upvotedPoll = copiedPolls.find( (poll) => poll.id == id);
            
            if (option === 'a') {
                upvotedPoll.votesA++;
            }
            if (option === 'b') {
                upvotedPoll.votesB++;
            }
            
            return copiedPolls;

        });
        
    };

    const handleDelete = (id) => {
        PollStore.update(currentPolls => {
            return currentPolls.filter(poll => poll.id != id); /* runs through currentPolls, and filters out all array items that don't match the poll.id from the delete button */
        });
    };

</script>

<style>
    .totalVotes {font-size:12px; color:hsl(255, 25%, 70%);}
    .option {margin:10px auto; padding: 5px 10px; background: hsl(255, 50%, 87%); border-radius:2px; position:relative;}
        .option:hover {color:hsl(0, 0%, 20%); background: hsl(255, 50%, 90%); cursor:pointer }
    .percent {height:100%; position: absolute; top: 0; left: 0; }
        .percent-a {border-left:4px hsl(330, 60%, 55%) solid; background:hsla(330, 60%, 55%, .7);}
        .percent-b {border-left:4px hsl(25, 100%, 50%) solid; background:hsla(25, 100%, 50%, .7);}
    .option span {color:#000; position:relative;}
    .delete {margin-top:30px; text-align:center;}
</style>

<Card>
<div class="poll">
    <h3>{poll.question}</h3>
    <span class="totalVotes">(total: {totalVotes})</span>
    <div class="option" on:click={() => handleVote('a', poll.id)}>
        <div class="percent percent-a" style="width:{percentA}%"></div>
        <span>{poll.optionA} ({poll.votesA})</span>  
    </div>
    <div class="option" on:click={() => handleVote('b', poll.id)}>
        <div class="percent percent-b" style="width:{percentB}%"></div>
        <span>{poll.optionB} ({poll.votesB})</span>    
    </div>
    <div class="delete">
        <Button ghost={true} small={true} on:click={() => {handleDelete(poll.id)}}>Delete</Button>
    </div>
</div>
</Card>
<script>
    import {tweened } from 'svelte/motion';
    import Card from '../shared/Card.svelte'; 
    import PollStore from '../stores/PollStore';
    import Button from '../shared/Button.svelte';
    export let poll;

    //reactive values
    $: totalVotes = poll.votesA + poll.votesB
    $: percentA = Math.floor(100 / totalVotes * poll.votesA)
    $: percentB = Math.floor(100 / totalVotes * poll.votesB)

    //tweened percentages


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
            return currentPolls.filter(poll => poll.id != id); /* Updating Currentpolls by returning the array with all the items that don't match the poll.id from the delete button. */
        });
    };

</script>

<style type="text/scss">
	@import '../styles/vars.scss';
    
    h3 {color:$accent-primary; font-weight:normal;}
    .totalVotes {font-size:12px; color:$gray95;}
    .option {margin:10px auto; padding: 5px 10px; background: $gray85; border-radius:2px; position:relative;
        span {color:#000; position:relative;}
        span::selection{background:rgba($gray95,.1)}
    }
    .option:hover {background: $gray95; cursor:pointer}
    
    .percent {height:100%; position: absolute; top: 0; left: 0; }
        .percent-a {border-left:4px $accent-primary solid; background:rgba($accent-primary, .5)}
        .percent-b {border-left:4px $accent-secondary solid; background:rgba($accent-secondary, .7);}
    
    .delete {margin-top:30px; text-align:center;}
</style>

<Card>

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

</Card>
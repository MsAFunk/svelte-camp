<script>
    import CreatePollForm from "./components/CreatePollForm.svelte";
    import PollList from "./components/PollList.svelte";
	import Tabs from './shared/Tabs.svelte';
    
    //tabs
	let items = ['Current Polls', 'Add New Poll'];
	let activeItem = 'Current Polls';
	const changeTab = (e) => {
		activeItem = e.detail;
    }

    //polls
    let polls = [
        {
            id: 1,
            question: 'What should I order for breakfast?',
            optionA: 'Waffles',
            optionB: 'Pancakes',
            votesA: 17,
            votesB: 2,
        },
        {
            id: 2,
            question: 'What should I order for lunch?',
            optionA: 'Sushi',
            optionB: 'Tteokbokki',
            votesA: 10,
            votesB: 15,
        },
        {
            id: 3,
            question: 'What should I order for dinner?',
            optionA: 'Pizza',
            optionB: 'Tacos',
            votesA: 12,
            votesB: 12,
        }
    ];

    const handleAdd = (e) => {
        const poll = e.detail;
        polls = [poll, ...polls];
        console.log(polls);
        activeItem = 'Current Polls'
    }

    /*const handleVote = (e) => {
        const {id, option} = e.detail;
        let copiedPolls = [...polls];
        let upvotedPoll = copiedPolls.find( (poll) => poll.id);
        
        if (option === 'a') {
            upvotedPoll.votesA++;
        }
        if (option === 'b') {
            upvotedPoll.votesB++;
        }
        let polls = copiedPolls;
    };*/
    
</script>

<style>

</style>

<h1>Polls</h1>
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget quam velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc convallis egestas purus. Cras non mi sit amet lacus blandit sagittis sit amet sit amet nulla. Quisque varius, quam a pharetra vestibulum, lorem magna commodo metus, a convallis odio justo eu mi. </p>
	<Tabs {items} {activeItem} on:tabChange={changeTab} />

	{#if activeItem === 'Current Polls'}
		<PollList {polls} />
	{:else if activeItem === 'Add New Poll'}
		<CreatePollForm on:add={handleAdd} />
	{/if}
<script>
    import CreatePollForm from "./CreatePollForm.svelte";
    import PollList from "./PollList.svelte";
	import Tabs from './PollTabs.svelte';
    
    //tabs
	let items = ['Current Polls', 'Add New Poll'];
	let activeItem = 'Add New Poll';
	const changeTab = (e) => {
		activeItem = e.detail;
    }



    const handleAdd = (e) => {
        activeItem = 'Current Polls'
    }
    
</script>

<style>

</style>

<h1>Polls</h1>
	<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eget quam velit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc convallis egestas purus. Cras non mi sit amet lacus blandit sagittis sit amet sit amet nulla. Quisque varius, quam a pharetra vestibulum, lorem magna commodo metus, a convallis odio justo eu mi. </p>
	<Tabs {items} {activeItem} on:tabChange={changeTab} />

	{#if activeItem === 'Current Polls'}
		<PollList />
	{:else if activeItem === 'Add New Poll'}
		<CreatePollForm on:add={handleAdd} />
	{/if}
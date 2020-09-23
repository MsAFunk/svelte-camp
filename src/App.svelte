<script>
	import Header from './components/Header.svelte';
	import Footer from './components/Footer.svelte';

	import PollsContent from './Polls/PollsContent.svelte';
	import GistContent from './GIST/GistContent.svelte';

	//navigation
	let mainNav = ['Polls', 'GIST', 'Placeholder'];
	let currentPage = 'Polls';
	const activePage = (e) => {
		currentPage = e.detail;
	}

</script>


<style type="text/scss"> 
	main {max-width:800px; margin:40px auto;}
	
</style>

<Header {mainNav} {currentPage} on:activatePage={activePage}/>
<main>
	{#if currentPage === 'Polls'}
		<PollsContent />
	{:else if currentPage === 'GIST'}
		<GistContent />
	{:else if currentPage === 'Placeholder'}
		<p style="text-align:center;">This page intentionally left blank</p>
	{/if}
</main>
<Footer />

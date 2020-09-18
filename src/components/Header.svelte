<script>
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();

    export let mainNav;
	export let currentPage; 

</script>

<style>
    header {
        width:100%; margin:0 auto; display:inline-block;
        background-color:#e6e6e6
    }
    h1 {font-size:24px; padding:10px 20px; display:inline-block;}
    .main-nav, .main-nav ul {display:inline-block; margin:0; padding:0;}
        .main-nav li{padding:10px 20px; display:inline-block; }
        .main-nav a {color:rgb(255, 126, 20);}
            .main-nav a.active {color:rgb(255, 0, 119);}
    
</style>

<header>
    <h1>Svelte Camp</h1>
    <nav class="main-nav">
        
        <ul>
            {#each mainNav as navItem}
            <li on:click={() => dispatch('activatePage', navItem)}>
                <a href="#{navItem}" class:active={navItem === currentPage} on:click="{() => currentPage = navItem}">{navItem}</a>
            </li>
            {/each}
        </ul>
    </nav>
</header>
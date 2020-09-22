<script>
    export let btnColor = 'pink';
    //export let textColor = "white" this is for passing colors as props
    export let shadow = false;
    export let ghost = false;
    export let small = false;
</script>

<style>
    button{
        padding:5px 20px; margin:0 auto; cursor:pointer; 
        /*color: var(--text-color); background: var(--bg-color); We can use these to accept the colors as props*/
        border-radius:5px;
    }
    .small {padding:2px 10px; margin:0 auto; font-size:12px}
    .pink {color:#fff; background: rgb(var(--accent-secondary)); border:1px solid rgb(var(--accent-secondary));}
    .pink.ghost {color:rgb(var(--accent-secondary)); background:transparent; border:1px rgb(var(--accent-secondary)) solid;}
    .pink.ghost:hover {color: #fff; background: rgb(var(--accent-secondary)); border:1px rgb(var(--accent-secondary)) solid;}
    
    .blue {color:#fff; background: hsl(210, 60%, 55%); border:1px solid hsl(210, 100%, 45%); }
    .blue.ghost {color:hsl(210, 55%, 60%); background: transparent; border:1px hsl(210, 60%, 55%) solid;}
    .blue.ghost:hover {color: #fff; background: hsl(210, 60%, 55%); border:1px hsl(210, 600%, 55%) solid;}
    .shadow {box-shadow:0 1px 3px rgba(0,0,0,.5)}
    
</style>

<button class={btnColor} class:shadow={shadow} class:ghost={ghost} class:small={small} on:click> <!--Put this back in to the button to accept custom colors: style="--bg-color: {btnColor}; --text-color: {textColor}" -->
    <slot></slot>
</button>
<script>
    export let btnColor = 'pink';
    //export let textColor = "white" this is for passing colors as props
    export let shadow = false;
    export let ghost = false;
</script>

<style>
    button{
        padding:5px 20px; margin:0 auto; cursor:pointer; 
        /*color: var(--text-color); background: var(--bg-color); We can use these to accept the colors as props*/
        border-radius:5px;
    }
    .pink {color:#fff; background: hsl(332, 100%, 50%); border:1px solid hsl(332, 100%, 45%);}
    .pink.ghost {color:hsl(332, 100%, 50%); background: #fff; border:1px hsl(332, 100%, 50%) solid;}
    
    .blue {color:#fff; background: hsl(210, 100%, 50%); border:1px solid hsl(210, 100%, 45%); }
    .blue.ghost {color:hsl(210, 100%, 50%); background: #fff; border:1px hsl(210, 100%, 50%);}
    
    .shadow {box-shadow:0 1px 3px rgba(0,0,0,.5)}
    
</style>

<button class={btnColor} class:shadow={shadow} class:ghost={ghost}> <!--Put this back in to the button to accept custom colors: style="--bg-color: {btnColor}; --text-color: {textColor}" -->
    <slot></slot>
</button>
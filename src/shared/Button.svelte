<script>
    export let btnColor = 'primary';
    //export let textColor = "white" this is for passing colors as props
    export let shadow = false;
    export let ghost = false;
    export let small = false;
</script>

<style type="text/scss">
    @import '../styles/vars.scss';

    button{
        padding:5px 20px; margin:0 auto; cursor:pointer; 
        /*color: var(--text-color); background: var(--bg-color); We can use these to accept the colors as props*/
        border-radius:5px;
    }
    .small {padding:2px 10px; margin:0 auto; font-size:12px}
    .primary {color:#fff; background: $accent-primary; border:1px solid $accent-primary;}
    .primary.ghost {color:$accent-primary; background:transparent; border:1px $accent-primary solid;}
    .primary.ghost:hover {color: #fff; background: $accent-primary; border:1px $accent-primary solid;}
    
    .secondary {color:#fff; background: $accent-secondary; border:1px solid $accent-secondary; }
    .secondary.ghost {color:$accent-secondary; background: transparent; border:1px $accent-secondary solid;}
    .secondary.ghost:hover {color: #fff; background: $accent-secondary; border:1px $accent-secondary solid;}

    .tertiary {color:#fff; background: $accent-tertiary; border:1px solid $accent-tertiary; }
    .tertiary.ghost {color:$accent-tertiary; background: transparent; border:1px $accent-tertiary solid;}
    .tertiary.ghost:hover {color: #fff; background: $accent-tertiary; border:1px $accent-tertiary solid;}
    .shadow {box-shadow:0 1px 3px rgba($gray5,.5)}
    
</style>

<button class={btnColor} class:shadow={shadow} class:ghost={ghost} class:small={small} on:click> <!--Put this back in to the button to accept custom colors: style="--bg-color: {btnColor}; --text-color: {textColor}" -->
    <slot></slot>
</button>
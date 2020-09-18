<script>
    import {createEventDispatcher} from 'svelte';
    import Button from '../shared/Button.svelte';
    
    let dispatch = createEventDispatcher();
    let fields = {question: '', optionA: '', optionB: ''}
    let errors = {question: '', optionA: '', optionB: ''}
    let valid = false;
   
    const submitHandler = () => {
        valid = true;

        //validate question
        if (fields.question.trim().length < 5){
            valid = false;
            errors.question = 'Question Must be at least 5 characters long';
        } else {
            errors.question = '';
        }

        //validate optionA
        if (fields.optionA.trim().length < 1){
            valid = false;
            errors.optionA = 'Option cannot be empty';
        } else {
            errors.optionA = '';
        }

        //validate optionB
        if (fields.optionB.trim().length < 1){
            valid = false;
            errors.optionB = 'Option cannot be empty';
        } else {
            errors.optionB = '';
        }

        if(valid){
            let poll = {...fields, votesA: 0, votesB: 0, id: Math.floor(Math.random() * 10000)}
            
            dispatch('add', poll);
        }
    }
</script>

<style>
    form {width:400px; margin:0 auto; padding:20px; border:1px #ccc solid; border-radius:5px;}
        .form-field {margin:20px auto;}
        label{margin:0 0 10px 0; display:block; font-size:14px;}
        input[type="text"] {width:100%; border:1px #ccc solid; border-radius: 5px;}
        .submit {text-align:center;}
        .error {padding:5px 0; font-size:13px; color:hsl(0, 75%, 55%);}
       
</style>

<form on:submit|preventDefault={submitHandler}>
    <div class="form-field">
        <label for="question">Poll Question:</label>
        <input type="text" id="question" bind:value={fields.question}>
        <div class="error">{errors.question}</div>
    </div>
    <div class="form-field">
        <label for="option-a">Option A:</label>
        <input type="text" id="option-a" bind:value={fields.optionA}>
        <div class="error">{errors.optionA}</div>
    </div>
    <div class="form-field">
        <label for="option-b">Option B:</label>
        <input type="text" id="option-b" bind:value={fields.optionB}>
        <div class="error">{errors.optionB}</div>
    </div>
    <div class="submit">
        <Button btnColor="pink">Add Poll</Button>
    </div>
</form>
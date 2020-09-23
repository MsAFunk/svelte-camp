<script>
    import PollStore from '../stores/PollStore';
    import {createEventDispatcher} from 'svelte';
    import Button from '../shared/Button.svelte';
    import Card from '../shared/Card.svelte';
    
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
            // save poll to store
            PollStore.update(currentPolls => {
                return [poll, ...currentPolls];
            });
            dispatch('add', poll);
        }
    }
</script>

<style type="text/scss">
    @import '../styles/vars.scss';

    form {width:400px; margin:0 auto; padding:20px; border-radius:5px;}
        .form-field {margin:10px auto;}
        label{margin:0 0 10px 0; display:block; font-size:14px;}
        input[type="text"] {
            width:100%; margin:0 auto; padding: 5px 10px;
            background: $gray90; border:1px $gray80; border-radius:2px;
        }
        input:focus{box-shadow:0 0 0 3px $accent-primary; outline:none;}
        .submit {text-align:center;}
        .error {padding:5px 0; font-size:13px; color:$error;}
       
</style>


<form on:submit|preventDefault={submitHandler}>
    <Card>
        <h3>Create A New Poll</h3>
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
            <Button>Add Poll</Button>
        </div>
    </Card>
</form>

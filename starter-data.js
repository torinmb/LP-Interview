//This is pasted into the browser console on the website to initially populate firebase.

let questions = [{
    question: "question 1",
    tokens : {
        token1 : 1,
        token2 : -1,
        token3: 1
    }
},
{
    question: "question 2",
    tokens : {
        token1 : -1,
        token2 : -1,
        token3: 1,
        token5: 1
    }
}];

const tokens = ['token1', 'token2', 'token3', 'token4', 'token5'];
//reset db
db.ref('questions').remove().catch(error => console.error(error));
db.ref('tokens').set(tokens);
// db.ref('questions').set(questions);
let questionsRef = db.ref('questions');
questions.forEach(question => {
    //use firebase to generate a unique id for each element
    questionsRef.push(question);
});
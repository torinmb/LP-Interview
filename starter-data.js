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
//reset db
db.ref('questions').remove().catch(error => console.error(error));
// db.ref('questions').set(questions);
let questionsRef = db.ref('questions');
questions.forEach(question => {
    //use firebase to generate a unique id for each element
    questionsRef.push(question);
});
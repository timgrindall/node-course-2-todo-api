const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '5a9f3ab32e237308beaea349';

// if (!ObjectID.isValid(id)) {
// 	console.log('ID not valid');
// }

// Todo.find({
// 	_id: id
// }).then((todos) => {
// 	console.log('Todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then((todo) => {
// 	console.log('Todo', todo);
// });


// // this is better
// Todo.findById(id).then((todo) => {
// 	console.log('Todo', todo);
// });

User.findById('5a9ef1c4a5930ae0440a1574').then((user) => {
	if (!user) {
		return console.log("Unable to find user");
	}

	console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
	console.log(e);
});

// changed something
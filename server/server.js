var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var ObjectId = require('mongoose').Types.ObjectId;

var app = express();

app.use(bodyParser.json());

// CRUD Create, Read, Update, Delete
app.post('/todos', (req, res) => {
	console.log(req.body);
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	})
});

app.get('/todos/:id', (req, res) => {
	var id = req.params.id;

	// Valid is using isValid
	if (!ObjectId.isValid(id)) {
		// 404 - send back empty send
		return res.status(404).send();	//forgot return statement
	}

	// findById
	Todo.findById(id).then((todo) => { // called it user instead of todo
		// success
		if (todo) {
			// if todo - send it back
			res.send(todo);
		} else if (!todo) {
			// if no todo - send back 404 with empty body
			res.status(404).send();
		}
	}, (e) => {
		// error
		res.status(400).send(); // note: do not send error object because it may have sensitive information
			// 400 - and send empty body back
	});
});

app.listen(3000, () => {
	console.log('Started on port 3000');
});

module.exports = {app};
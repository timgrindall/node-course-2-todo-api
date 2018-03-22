require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var ObjectId = require('mongoose').Types.ObjectId;

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

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
			res.send({todo});
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

app.delete('/todos/:id', (req, res) => {
	// get the id
	var id = req.params.id;

	// validate the id -> not valid? return 404
	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}

	// remove todo by id
	Todo.findByIdAndRemove(id).then((todo) => {  //success

		//if no doc, send 404
		if (!todo) {
			return res.status(404).send();
		}
		//if doc, send doc back with 200
		res.send({todo});

	}).catch((err) => {  //error
		// 400 with empty body
		// console.log('error', err);
		res.status(400).send();	//don't send back the error
	});
});

app.patch('/todos/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;	var user = new User(body);
		body.completedAt = null;
	}

	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
		if (!todo) {
			return res.status(404).send();
		}

		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

// POST /users
app.post('/users', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((e) => {
		// console.log('something happened (400)!');
		// console.log(e);
		res.status(400).send(e);
	});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

//POST /users/login {email, password}
app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user);
		});
	}).catch((e) => {
		res.status(400).send();
	});
});

app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

app.listen(port, () => {
	console.log(`Started up at port ${port}`);
});

module.exports = {app};

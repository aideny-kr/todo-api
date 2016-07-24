var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

// Adding Body Parser middleware
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
  // query string ?completed=true
  var queryParams = req.query;
  var filteredTodos = todos;

  if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filteredTodos = _.where(filteredTodos, {completed: true});
  } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    filteredTodos = _.where(filteredTodos, {completed: false});
  }

  res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = +req.params.id;
  var matchedTodo = _.findWhere(todos, {id : todoId});
  if(matchedTodo) {
    res.json(matchedTodo);
  }
  else res.status(404).send();

});

// POST /todos
app.post('/todos', function(req, res) {

  var body = _.pick(req.body, 'description', 'completed');

  if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ) {
    // sending response "bad request"
    return res.status(400).send();
  }

  body.description = body.description.trim()

    // set id to todoNextId and increment todoNextId
  body.id = todoNextId++;
    // push to todos array
  todos.push(body);


  res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = +req.params.id;
  var matchedTodo = _.findWhere(todos, {id: todoId});
  if(matchedTodo) {
    var newTodos = _.without(todos, matchedTodo);
    todos = newTodos;
    res.json(matchedTodo);
  }
  else {
    res.status(404).json({"error": "no todo found with that id"});
  }
});

// PUT /todos/:id
app.put('/todos/:id', function (req, res) {
  var todoId = +req.params.id;
  var matchedTodo = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  // 404 not found
  if(!matchedTodo) {
    return res.status(404).send();
  }

  // validates 'completed'
  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    // 400 bad syntax
    return res.status(400).send();
  }

  // validates 'description'
  if (body.hasOwnProperty('description') && _.isString(body.description)
  && body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }
  // extend alters first argument(object) according to 2nd argument
  _.extend(matchedTodo, validAttributes);

  res.json(matchedTodo);

});

app.listen(PORT, function() {
  console.log('Express listening on PORT ' + PORT);
});

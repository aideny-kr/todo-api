var express = require('express');
var bodyParser = require('body-parser');
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
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  var todoId = +req.params.id;
  var matchedTodo;
  todos.forEach(function (todo) {
    if (todoId === todo.id) {
      matchedTodo = todo;
    }
  });

  if(matchedTodo) res.json(matchedTodo);
  else res.status(404).send();

  res.send('Asking for todo with id of ' + req.params.id);
});

// POST /todos
app.post('/todos', function(req, res) {
  var body = req.body;
  if(body) {
    // set id to todoNextId and increment todoNextId
    body.id = todoNextId++;
    // push to todos array
    todos.push(body);
  }

  res.json(body);
});

app.listen(PORT, function() {
  console.log('Express listening on PORT ' + PORT);
})

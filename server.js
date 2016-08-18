var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

// middleware
var middleware = require('./middleware')(db);

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
app.get('/todos', middleware.requireAuthentication, function (req, res) {

  // query string ?completed=true
  var queryParams = req.query;
  var where = {
    userId: req.user.get('id')
  };

  if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    where.completed = true;
  } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
    where.completed = false;
  }

  if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    where.description = {$like : '%' + queryParams.q + '%'};
  }

  db.todo.findAll({
    where: where
  }).then(function(todos) {
    if(todos) {
      res.json(todos);
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });

  // var filteredTodos = todos;
  //
  // // ?complete=true/false
  // if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
  //   filteredTodos = _.where(filteredTodos, {completed: true});
  // } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
  //   filteredTodos = _.where(filteredTodos, {completed: false});
  // }
  //
  // // ?q=keyword
  // if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
  //   filteredTodos = _.filter(filteredTodos, function(todo) {
  //     return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
  //   });
  // }
  //
  // res.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = +req.params.id;
  // var matchedTodo = _.findWhere(todos, {id : todoId});
  // if(matchedTodo) {
  //   res.json(matchedTodo);
  // }
  // else res.status(404).send();
  db.todo.findOne({where: {
    id: todoId,
    userId: req.user.get('id')
  }})
    .then(function(todo){
      if(todo){
        res.json(todo.toJSON());
      } else {
        res.status(404).send();
      }
    })
    .catch(function(e) {
      res.status(500).send();
    })
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {

  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function(todo){
    //req.user is accessible from middleware
    req.user.addTodo(todo).then(function () {
      return todo.reload();
    }).then(function (todo) {
      res.status(200).send(todo.toJSON());
    })
  }, function(e) {
    res.status(400).send();
  })

  // if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ) {
  //   // sending response "bad request"
  //   return res.status(400).send();
  // }
  //
  // body.description = body.description.trim()
  //
  //   // set id to todoNextId and increment todoNextId
  // body.id = todoNextId++;
  //   // push to todos array
  // todos.push(body);
  //
  //
  // res.json(body);
});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
  var todoId = +req.params.id;
  db.todo.destroy({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then(function(rowsDeleted) {
    if(rowsDeleted === 0) {
      res.status(404).json({
        error: 'No todo with ID'
      });
    } else {
      res.status(204).send();
    }

  }, function(e) {
    res.status(500).send();
  });

  // var matchedTodo = _.findWhere(todos, {id: todoId});
  // if(matchedTodo) {
  //   var newTodos = _.without(todos, matchedTodo);
  //   todos = newTodos;
  //   res.json(matchedTodo);
  // }
  // else {
  //   res.status(404).json({"error": "no todo found with that id"});
  // }
});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
  var todoId = +req.params.id;
  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  // validates 'completed'
  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }
  // validates 'description'
  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findOne({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then(function (todo){
    if(todo) {
      todo.update(attributes).then(function (todo) {
        res.json(todo.toJSON());
      }, function(e) {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });

});

// POST USER
app.post('/users', function(req, res){
  var body = _.pick(req.body, 'email', 'password');

  db.user.create({
    email: body.email,
    password: body.password
  }).then(function (user) {
    res.json(user.toPublicJSON());
  }, function(e) {
    res.status(400).send(e);
  });
});

// POST /users/login
app.post('/users/login', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function(user) {
    var token = user.generateToken('authentication');
    if(token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }

  }, function(e) {
    res.status(401).send();
  });
});

db.sequelize.sync({force:true}).then(function(){

  app.listen(PORT, function() {
    console.log('Express listening on PORT ' + PORT);
  });
})

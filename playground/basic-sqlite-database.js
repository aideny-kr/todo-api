var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

// build model

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,  //validation null if not allowed
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

var User = sequelize.define('user', {
  email: Sequelize.STRING
});

// Setting up Foreign Keys.
Todo.belongsTo(User);
User.hasMany(Todo);

// {force:true} as param in sync will drop all table and start from beginning
sequelize.sync({
//  force:true
}).then(function() {
  console.log('Everything is in sync');

  User.findById(1).then(function (user) {
    user.getTodos({
      where: {
        completed: false
      }
    }).then(function (todos) {
      todos.forEach(function (todo) {
        console.log(todo.toJSON());
      });
    })
  })

  // User.create({
  //   email: 'huichanyi@gmail.com'
  // }).then(function () {
  //   return Todo.create({
  //     description: 'Clean yard'
  //   }).then (function(todo) {
  //     User.findById(1).then(function(user) {
  //       user.addTodo(todo);
  //     });
  //   })
  // })
});

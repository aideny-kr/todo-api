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

// {force:true} as param in sync will drop all table and start from beginning
sequelize.sync({
  //force:true
}).then(function() {
  console.log('Everything is in sync');

  Todo.findById(2).then(function(todo) {
    if(todo) {
      console.log(todo.toJSON());
    } else {
      console.log('No todo found');
    }
  });
  // Todo.create({
  //   description: 'Take out trash',
  //   //completed: false
  // }).then(function (todo) {
  //   return Todo.create({
  //     description: 'Clean the office'
  //   })
  // }).then(function (todo) {
  //     //return Todo.findById(1)
  //     return Todo.findAll({
  //       where: {
  //         description: {
  //           $like: '%trash%'
  //         }
  //       }
  //     });
  // }).then(function (todos) {
  //     if(todos) {
  //       todos.forEach(function(todo){
  //         console.log(todo.toJSON());
  //       });
  //     } else {
  //       console.log('No todo found');
  //     }
  // }).catch(function(e) {
  //   console.log(e);
  // });
});

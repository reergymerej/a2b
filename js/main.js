var taskManager = new TaskManager(),
  taskEditor;

var taskEdit;

// keeps track of all the Task instances
function TaskManager() {
  this.tasks = [];
  this.taskMap = {};
  this.count = 0;
  this.add = function(task) {
    var index = this.tasks.push(task) - 1;
    this.taskMap[task.id] = task;
    this.count++;
  };
  this.getById = function(id) {
    return this.taskMap[id];
  };
}

// tool for editing a Task
function TaskEditor() {
  var me = this;

  this.el = $('#taskEdit');
  this.task = undefined;

  // listen for cancel
  this.el.on('click', 'a', function (event) {
    me.close();
    event.preventDefault();
    return false;
  });

  // listen for save
  this.el.on('submit', 'form', function (event) {
    var valuesArr = $(this).serializeArray(),
      values = {};
    
    $.each(valuesArr, function (index, pair) {
      values[pair.name] = pair.value;
    });

    me.task.setLabel(values.label);
    me.task.description = values.description;

    event.preventDefault();
    me.close();
    return false;
  });

  this.editTask = function (task) {
    var me = this;

    this.task = task;

    this.el.find('[name="label"]').val(task.label);
    this.el.find('[name="description"]').val(task.description);
    
    this.el.fadeIn('fast', function () {
      // me.el.find('input').first().focus();
      me.el.find('input').first().select();
    });
  };

  this.close = function () {
    this.el.fadeOut('fast');
  };
};

// Task
function Task(parentTaskId) {
  this.id = Date.now();
  this.label = 'new task #' + this.id;
  this.description = undefined;
  this.subTasks = [];
  this.parentTaskId = parentTaskId;
  taskManager.add(this);
  this.createEl();
  this.setLabel(this.label);
  // this.edit();
}

Task.prototype.destroy = function () {
  // confirm?
  console.log('destroying task ' + this.id);

  // remove each subTask
  $.each(this.subTasks, function (index, task) {
    task.destroy();
  });

  // remove from TaskManager
  delete taskManager.taskMap[this.id];

  // remove ui
  this.getEl().remove();
};

Task.prototype.toggleRecord = function () {
  console.log('toggleRecord');
};

Task.prototype.setLabel = function (label) {
  this.label = label;
  this.getEl().find('.text').first().html(label);
};

Task.prototype.edit = function () {
  taskEditor.editTask(this);
};

Task.prototype.createEl = function () {
  var parentTask;

  this.el = $(_.template($('#task-template').html(), {})).data('taskId', this.id);
  this.el.attr('id', this.id);
  
  if (this.parentTaskId === undefined) {
    $('#taskWrapper').append(this.el);
  } else {
    parentTask = taskManager.getById(this.parentTaskId);
    parentTask.getSubTaskEl().append(this.el);
  }
};

Task.prototype.addSubTask = function () {
  this.subTasks.push(new Task(this.id));

  // work up parent tasks and ensure they are not done
  if (this.parentTaskId !== undefined) {
    taskManager.getById(this.parentTaskId).setDone(false);
  }
};

Task.prototype.getEl = function () {
  return $('#' + this.id);
};

Task.prototype.getSubTaskEl = function () {
  return this.getEl().find('.subtasks').first();
};

Task.prototype.setDone = function (done) {
  var el = this.getEl(),
    text = el.find('.text').first(),
    checkbox = el.find('input[type="checkbox"]').first();

  checkbox.prop('checked', done);
  this.done = done;

  if (done) {
    text.addClass('done');
    $.each(this.subTasks, function (index, task) {
      task.setDone(done);
    });
  } else {
    text.removeClass('done');
    if (this.parentTaskId !== undefined) {
      taskManager.getById(this.parentTaskId).setDone(done);
    }
  }
};

// ===============================

$(function () {

  function onTaskClick(event) {
    var target = $(event.target),
      taskEl = target.closest('.task'),
      taskId = taskEl.closest('.taskContainer').data('taskId'),
      task = taskManager.getById(taskId);

    if (event.target.tagName === 'INPUT') {
      task.setDone(event.target.checked);
      return;
    } else if (target.is('.button')) {

      switch (event.target.className) {
      case 'button edit':
        task.edit();
        break;
      case 'button x':
        task.destroy();
        break;
      case 'button record':
        task.toggleRecord();
        break;
      case 'button add':
        task.addSubTask();
        break;
      default:
        console.error('What does this button do?');
      }

    } else {
      // toggle the controls
      $(this).next().toggle();
    }

    event.preventDefault();
    return false;
  }

  $('body').on('click', '.task .button, .task .label', onTaskClick);

  $('#newTask').click(function () {
    new Task();
  });

  taskEditor = new TaskEditor();
});
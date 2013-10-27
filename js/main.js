var taskManager = new TaskManager(),
  taskEditor;
var taskEdit;
// keeps track of all the Task instances
function TaskManager() {
  this.tasks = [];
  this.taskMap = {};
}

function TaskEditor() {
  var me = this;

  this.el = $('#taskEdit');
  this.task = undefined;

  this.el.on('click', 'a', function (event) {
    me.close();
    event.preventDefault();
    return false;
  });

  // save data to Task
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
      me.el.find('input').first().focus();
    });
  };

  this.close = function () {
    this.el.fadeOut('fast');
  };
};

TaskManager.prototype.add = function(task) {
  var index = this.tasks.push(task) - 1;
  this.taskMap[task.id] = index;
};

TaskManager.prototype.getById = function(id) {
  return this.tasks[this.taskMap[id]];
};

function Task(parentTaskId) {
  this.id = Date.now();
  this.label = 'new task';
  this.description = undefined;
  this.subTasks = [];
  this.parentTaskId = parentTaskId;
  taskManager.add(this);
  this.createEl();
  this.setLabel(this.label);
}

Task.prototype.setLabel = function (label) {
  this.label = label;
  this.getEl().find('.text').first().html(label);
};

Task.prototype.editTask = function () {
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
};

Task.prototype.getEl = function () {
  return $('#' + this.id);
  // return this.el;
};

Task.prototype.getSubTaskEl = function () {
  return this.getEl().find('.subtasks').first();
};

 // ===============================

$(function () {
  var tasks = [];
  taskEdit = $('#taskEdit');

  function deleteTask(taskEl) {
    console.log('deleteTask');
  }

  function toggleRecordTask(taskEl) {
    console.log('toggleRecordTask');
  }

  function setTaskLabel(taskEl, label) {
    taskEl.find('.text').first().html(label);
  }

  function onTaskClick(event) {
    var target = $(event.target),
      taskEl = target.closest('.task'),
      taskId = taskEl.closest('.taskContainer').data('taskId'),
      task = taskManager.getById(taskId);

    if (event.target.tagName === 'INPUT') {
      // console.log(event.target.checked);
      $('.text', taskEl).first().toggleClass('done');
      return;
    } else if (target.is('.button')) {

      switch (event.target.className) {
      case 'button edit':
        // editTask(taskEl, task);
        task.editTask();
        break;
      case 'button x':
        deleteTask(task);
        break;
      case 'button record':
        toggleRecordTask(task);
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
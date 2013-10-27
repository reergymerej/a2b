var taskManager = new TaskManager();

// keeps track of all the Task instances
function TaskManager() {
  this.tasks = [];
  this.taskMap = {};
}

TaskManager.prototype.add = function(task) {
  var index = this.tasks.push(task) - 1;
  this.taskMap[task.id] = index;
};

TaskManager.prototype.getById = function(id) {
  return this.tasks[this.taskMap[id]];
};

function Task(parentTaskId) {
  this.id = Date.now();
  this.subTasks = [];
  this.parentTaskId = parentTaskId;
  taskManager.add(this);
  this.createEl();
}

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
  var taskEdit = $('#taskEdit');

  function deleteTask(taskEl) {
    console.log('deleteTask');
  }

  function toggleRecordTask(taskEl) {
    console.log('toggleRecordTask');
  }

  function editTask(taskEl, task) {
    taskEdit.find('[name="label"]').val(taskEl.find('.text').first().html());
    taskEdit.data('taskEl', taskEl);
    openTaskEdit(taskEl);
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
        editTask(taskEl, task);
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

  function closeTaskEdit() {
    taskEdit.fadeOut('fast');
  }

  function openTaskEdit(task) {
    taskEdit.fadeIn('fast', function () {
      taskEdit.find('input').first().focus();
    });
  }

  $('body').on('click', '.task .button, .task .label', onTaskClick);

  $('#newTask').click(function () {
    new Task();
  });

  taskEdit.on('click', 'a', function (event) {
    closeTaskEdit();
    event.preventDefault();
    return false;
  });

  taskEdit.on('submit', 'form', function (event) {
    var valuesArr = $(this).serializeArray(),
      values = {};
    
    $.each(valuesArr, function (index, pair) {
      values[pair.name] = pair.value;
    });

    setTaskLabel(taskEdit.data('taskEl'), values.label);
    event.preventDefault();
    closeTaskEdit();
    return false;
  });
});
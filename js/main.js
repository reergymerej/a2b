var taskManager = new TaskManager(),
  taskEditor;

var taskEdit;

// keeps track of all the Task instances
function TaskManager() {
  this.taskMap = {};
  this.count = 0;
}

/**
* @param {String/Number} [parentTaskId]
* @return {Task}
*/
TaskManager.prototype.add = function (parentTaskId) {
  var task = new Task(parentTaskId);
  this.taskMap[task.id] = task;
  this.count++;
  return task;
};

TaskManager.prototype.getById = function (id) {
  return this.taskMap[id];
};

/**
* @param {Number/String} taskId
*/
TaskManager.prototype.remove = function (taskId) {
  if (this.taskMap.hasOwnProperty(taskId)) {
    delete this.taskMap[taskId];
    this.count--;
  }
};

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
}

// Task
function Task(parentTaskId) {
  this.id = Date.now();
  this.label = 'new task #' + this.id;
  this.description = undefined;
  this.subTasks = [];
  this.parentTaskId = parentTaskId;
  this.createEl();
  this.setLabel(this.label);
  // this.edit();
  this.work = [];
  this.inProgress = false;
  this.duration = 0;
}

/**
* @param {Boolean} [skipConfirm]
*/
Task.prototype.destroy = function (skipConfirm) {
  if (skipConfirm || confirm('Are you sure?')) {
    // remove each subTask
    $.each(this.subTasks, function (index, task) {
      task.destroy(true);
    });

    // remove from TaskManager
    taskManager.remove(this.id);

    // remove ui
    this.getEl().remove();
  }
};

Task.prototype.toggleRecord = function () {
  var el = this.getEl(),
    button = el.find('.task .controls .record');

  if (this.inProgress) {
    this.pause();
    button.removeClass('inProgress');
  } else {
    this.record();
    button.addClass('inProgress');
  }

  this.inProgress = !this.inProgress;
};

/**
* Start a new chunk of work.
*/
Task.prototype.record = function () {
  this.work.push({
    start: Date.now(),
    end: undefined,
    duration: undefined
  });
};

/**
* Complete the last chunk of work.
* @return {Number} total miliseconds of work done for this Task
*/
Task.prototype.pause = function () {
  var lastWork = this.work.pop(),
    totalDuration = 0;

  if (!lastWork.duration) {
    lastWork.end = Date.now();
    lastWork.duration = lastWork.end - lastWork.start;
    this.work.push(lastWork);
    $.each(this.work, function (i, work) {
      totalDuration += work.duration;
    });
    this.duration = totalDuration;
  } else {
    console.error('this work has already been paused');
  }
  return this.duration;
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
  this.subTasks.push(taskManager.add(this.id));
  this.setDone(false);
};

Task.prototype.getEl = function () {
  return $('#' + this.id);
};

Task.prototype.getSubTaskEl = function () {
  return this.getEl().find('.subtasks').first();
};

/**
* @param {Boolean} done
* @param {Boolean} [finishChildTasks=true]
*/
Task.prototype.setDone = function (done, finishChildTasks) {
  var el = this.getEl(),
    text = el.find('.text').first(),
    checkbox = el.find('input[type="checkbox"]').first(),
    parentTask;

  if (finishChildTasks === undefined) {
    finishChildTasks = true;
  }

  checkbox.prop('checked', done);
  this.done = done;

  if (this.parentTaskId !== undefined) {
    parentTask = taskManager.getById(this.parentTaskId);
  }

  if (done) {
    text.addClass('done');
    if (finishChildTasks) {
      $.each(this.subTasks, function (index, task) {
        task.setDone(done);
      });
    }
    if (parentTask) {
      parentTask.onSubTaskDone();
    }
  } else {
    text.removeClass('done');
    if (parentTask) {
      parentTask.setDone(done);
    }
  }
};

Task.prototype.onSubTaskDone = function () {
  var subTasksDone = true;

  $.each(this.subTasks, function (index, task) {
    subTasksDone = !!task.done;
    return subTasksDone;
  });

  if (subTasksDone) {
    this.setDone(true, false);
  }
};

// ===============================

$(function () {

  function onTaskClick(event) {
    var returnValue,
      target = $(event.target),
      taskEl = target.closest('.task'),
      taskId = taskEl.closest('.taskContainer').data('taskId'),
      task = taskManager.getById(taskId);

    if (!task) {
      console.error('unable to figure out what task this is');
    }

    if (event.target.tagName === 'INPUT') {
      task.setDone(event.target.checked);
    } else {
      if (target.is('.button')) {

        // TODO don't switch on className
        switch (event.target.className) {
        case 'button edit':
          task.edit();
          break;
        case 'button x':
          task.destroy();
          break;
        case 'button record':
        case 'button record inProgress':
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
      returnValue = false;
    }

    return returnValue;
  }

  $('body').on('click', '.task .button, .task .label', onTaskClick);

  $('#newTask').click(function () {
    taskManager.add();
  });

  taskEditor = new TaskEditor();
});
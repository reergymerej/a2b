$(function () {
  var tasks = [];
  var taskEdit = $('#taskEdit');

  function Task() {
    this.id = Date.now();
  }

  function addSubTask(taskEl) {
    console.log('addSubTask');
    taskEl.parent().children('.subtasks').append(getNewTaskElement());
  }

  function deleteTask(taskEl) {
    console.log('deleteTask');
  }

  function toggleRecordTask(taskEl) {
    console.log('toggleRecordTask');
  }

  function editTask(taskEl, task) {
    console.log('editTask');
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
      task = taskEl.closest('ul').data('task');

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
        addSubTask(taskEl);
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

  function getNewTaskElement() {
    var newTask = new Task();
    tasks.push(newTask);
    return $(_.template($('#task-template').html(), {})).data('task', newTask);
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
    $('#taskWrapper').append(getNewTaskElement());
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
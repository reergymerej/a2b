<?php

class Rest extends RestEasy {

	public $table = 'task';
	public $idField = 'id';

	public function __construct() {
		$this->add('id', 'number', true);
		$this->add('parentTaskId', 'number');
		$this->add('label');
		$this->add('description');
		$this->add('start', 'number');
		$this->add('end', 'number');
		$this->add('duration', 'number');
		$this->add('inProgress', 'boolean');
	}
}
?>
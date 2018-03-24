var colors = {
	blank: 0,
	white: 1,
	cyan: 2,
	red: 3,
	pink: 4,
	blue: 5,
	green: 6,
	lime: 7,
	black: 8,
	purple: 9,
	gray: 10,
	orange: 11,
	yellow: 12,
	lightblue: 13,
	magenta: 14,
	brown: 15
}

var num_to_color = {
	0: 'blank',
	1: 'lol',
	2: 'lol',
	3: 'lol',
	4: 'lol',
	5: 'lol',
	6: 'lol',
	7: 'lol',
	8: 'lol',
	9: 'lol',
	10: 'lol',
	11: 'lol',
	12: 'lol',
	13: 'lol',
	14: 'lol',
	15: 'lol'
}

// from https://picoledelimao.github.io/blog/2015/12/06/solving-the-sliding-puzzle/

var Direction = {
  LEFT: "left",
  RIGHT: "right",
  UP: "up",
  DOWN: "down"
};

var Algorithm = {
  BFS: "BFS",
  AMisplaced: "A*: Misplaced tiles",
  AManhattan: "A*: Manhattan distance"
};

function Puzzle(dimension, solve_func) {
  this.board = [];
  this.path = [];
  this.dimension = dimension;
  this.solve_func = solve_func;
  this.lastMove = null;
  for (var i = 0; i < dimension; i++) {
      this.board.push([]);
      for (var j = 0; j < dimension; j++) {
          if (i == this.dimension - 1 && j == this.dimension - 1) {
              this.board[i].push(0);
          } else {
              this.board[i].push(dimension * i + j + 1);
          }
      }
  }
};

// Get the (x, y) position of the blank space
Puzzle.prototype.getBlankSpacePosition = function() {
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          if (this.board[i][j] == 0) {
              return [i, j];
          }
      }
  }
};

// Swap two items on a bidimensional array
Puzzle.prototype.swap = function(i1, j1, i2, j2) {
  var temp = this.board[i1][j1];
  this.board[i1][j1] = this.board[i2][j2];
  this.board[i2][j2] = temp;
}

// Return the direction that a piece can be moved, if any
Puzzle.prototype.getMove = function(piece) {
  var blankSpacePosition = this.getBlankSpacePosition();
  var line = blankSpacePosition[0];
  var column = blankSpacePosition[1];
  if (line > 0 && piece == this.board[line-1][column]) {
      return Direction.DOWN;
  } else if (line < this.dimension - 1 && piece == this.board[line+1][column]) {
      return Direction.UP;
  } else if (column > 0 && piece == this.board[line][column-1]) {
      return Direction.RIGHT;
  } else if (column < this.dimension - 1 && piece == this.board[line][column+1]) {
      return Direction.LEFT;
  }
};

// Move a piece, if possible, and return the direction that it was moved
Puzzle.prototype.move = function(piece) {
  var move = this.getMove(piece);
  if (move != null) {
      var blankSpacePosition = this.getBlankSpacePosition();
      var line = blankSpacePosition[0];
      var column = blankSpacePosition[1];
      switch (move) {
      case Direction.LEFT:
          this.swap(line, column, line, column + 1);
          break;
      case Direction.RIGHT:
          this.swap(line, column, line, column - 1);
          break;
      case Direction.UP:
          this.swap(line, column, line + 1, column);
          break;
      case Direction.DOWN:
          this.swap(line, column, line - 1, column);
          break;
      }
      if (move != null) {
          this.lastMove = piece;
      }
      return move;
  }
};

Puzzle.prototype.isGoalState = function() {
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          var piece = this.board[i][j];
          if (piece != 0) {
              var originalLine = Math.floor((piece - 1) / this.dimension);
              var originalColumn = (piece - 1) % this.dimension;
              if (i != originalLine || j != originalColumn) return false;
          }
      }
  }
  return true;
};

// Return a copy of current puzzle
Puzzle.prototype.getCopy = function() {
  var newPuzzle = new Puzzle(this.dimension);
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          newPuzzle.board[i][j] = this.board[i][j];
      }
  }
  for (var i = 0; i < this.path.length; i++) {
      newPuzzle.path.push(this.path[i]);
  }
  return newPuzzle;
};

// Return all current allowed moves
Puzzle.prototype.getAllowedMoves = function() {
  var allowedMoves = [];
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          var piece = this.board[i][j];
          if (this.getMove(piece) != null) {
              allowedMoves.push(piece);
          }
      }
  }
  return allowedMoves;
};

Puzzle.prototype.visit = function() {
  var children = [];
  var allowedMoves = this.getAllowedMoves();
  for (var i = 0; i < allowedMoves.length; i++)  {
      var move = allowedMoves[i];
      if (move != this.lastMove) {
          var newInstance = this.getCopy();
          newInstance.move(move);
          newInstance.path.push(move);
          children.push(newInstance);
      }
  }
  return children;
};

Puzzle.prototype.solveBFS = function() {
  var startingState = this.getCopy();
  startingState.path = [];
  var states = [startingState];
  while (states.length > 0) {
      var state = states[0];
      states.shift();
      if (state.isGoalState()) {
          return state.path;
      }
      states = states.concat(state.visit());
  }
};

Puzzle.prototype.g = function() {
  return this.path.length;
};

Puzzle.prototype.getManhattanDistance = function() {
  var distance = 0;
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          var piece = this.board[i][j];
          if (piece != 0) {
              var originalLine = Math.floor((piece - 1) / this.dimension);
              var originalColumn = (piece - 1) % this.dimension;
              distance += Math.abs(i - originalLine) + Math.abs(j - originalColumn);
          }
      }
  }
  return distance;
};

Puzzle.prototype.countMisplaced = function() {
  var count = 0;
  for (var i = 0; i < this.dimension; i++) {
      for (var j = 0; j < this.dimension; j++) {
          var piece = this.board[i][j];
          if (piece != 0) {
              var originalLine = Math.floor((piece - 1) / this.dimension);
              var originalColumn = (piece - 1) % this.dimension;
              if (i != originalLine || j != originalColumn) count++;
          }
      }
  }
  return count;
}

Puzzle.prototype.h = function() {
  if (this.solve_func == Algorithm.AMisplaced) {
      return this.countMisplaced();
  } else {
      return this.getManhattanDistance();
  }
};

Puzzle.prototype.solveA = function() {
  var states = new MinHeap(null, function(a, b) {
      return a.distance - b.distance;
  });
  this.path = [];
  states.push({puzzle: this, distance: 0});
  while (states.size() > 0) {
      var state = states.pop().puzzle;
      if (state.isGoalState()) {
          return state.path;
      }
      var children = state.visit();
      for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var f = child.g() + child.h();
          states.push({puzzle : child, distance: f});
      }
  }
};

Puzzle.prototype.solve = function() {
  if (this.solve_func == Algorithm.BFS) {
      return this.solveBFS();
  } else {
      return this.solveA();
  }
};

// custom code using Puzzle
var puz;
var solution_console_div;
var solution_list_div;
function initialize() {
	// save divs
	solution_console_div = document.getElementById('solution_console');
	solution_list_div = document.getElementById('solution_list');

	puz = new Puzzle(4, Algorithm.AManhattan);
	puz.board[3][1] = 0;
	puz.board[3][2] = 14;
	puz.board[3][3] = 15;
	console.log(puz);
}

function update_square(id_col, id_input) {
	var val = document.getElementById(id_input).value;
	var className = 'color ' + val;

	// set className
	document.getElementById(id_col).className = className;
}

function readSolution() {
	for( var i = 0; i < 16; i++ ) {
		var id_sol_in = i.toString() + '_sol_color';
		var val = document.getElementById(id_sol_in).value;
		//console.log(id_sol_in, ':', val);
		if( val in colors ) {
			var num = (i + 1) % 16;
			colors[val] = num;
			num_to_color[num.toString()] = val;
		}
		else {
			throw val;
		}
	}
	//console.log('GOT COLS!', colors, num_to_color);
}

function readInput() {
	// board
	var board = puz.board;

	// set board
	for( var i = 0; i < 16; i++ ) {
		var id_in = i.toString() + '_in_color';
		var val = document.getElementById(id_in).value;
		if( val in colors ) {
			var index1 = Math.floor(i/4);
			var index2 = i % 4;
			board[index1][index2] = colors[val];
		}
		else {
			throw val;
		}
	}

	console.log('BOARD IS HERE!: ', board);
}

function printSolution(solution) {
	var len = solution.length;
	for(var i = 0; i < len; i++ ) {
		console.log('SOLUTION', i, num_to_color[solution[i].toString()]);
		var node = document.createElement('p');
		node.innerHTML = i.toString() + ': ' + num_to_color[solution[i].toString()];
		solution_list_div.appendChild(node);
	}
}

function solve() {
	// remove all solution outputs
	while(solution_list_div.hasChildNodes()) {
		solution_list_div.removeChild(solution_list_div.lastChild);
	}

	try {
		readSolution();
	} catch (err) {
		solution_console_div.innerHTML = 'ree unknown solution color: ' + err;
		return;
	}

	try {
		readInput();
	} catch (err) {
		solution_console_div.innerHTML = 'ree unknown input color: ' + err;
		return;
	}

	solution_console_div.innerHTML = 'SOLVING...';
	console.log('SOLVING PUZZLE');
	var solution = puz.solve();


	console.log('SOLVED: ', solution);

	// print out solution
	printSolution(solution);

	solution_console_div.innerHTML = 'click to solve NEW miney man slidey puzzl';
}

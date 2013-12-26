var sk = null;

window.addEventListener("load", function(){
	sk = new Scorekeep();
	document.body.appendChild(sk.element);
	sk.getPlayerCount(function(num){sk.initializeScoreboard(num);});
});

function validateNum(str, zero) {
	var num = ~~Number(str);
	if (String(num) === str && (num > 0 || (num == 0 && zero))) {
		return num;
	}
	return NaN;
}

function createTextCell(str) {
	var td = document.createElement("td");
	td.appendChild(document.createTextNode(str));
	return td;
}

Scorekeep = function() {
	this.element = document.createElement("div");
};

Scorekeep.prototype.getPlayerCount = function(callback) {
	var t = this;
	var countDiv = document.createElement("div");
	countDiv.appendChild(document.createTextNode("Input the number of players:"));
	var countInput = document.createElement("input");
	countInput.value = "3";
	countDiv.appendChild(countInput);
	var countSubmit = document.createElement("input");
	countSubmit.type = "button";
	countSubmit.value = "Start";
	countDiv.appendChild(countSubmit);
	this.element.appendChild(countDiv);
	countSubmit.addEventListener("click", function(){
		var num = validateNum(countInput.value,false);
		if (num+1) {
			t.element.removeChild(countDiv);
			if (callback) {
				callback(num);
			}
		} else {
			alert(countInput.value + " is not a valid number");
		}
	});
};

Scorekeep.prototype.initializeScoreboard = function(players) {
	var t = this;
	t.table = document.createElement("table");
	{
		var tr = document.createElement("tr");
		var tr2 = document.createElement("tr");
		tr.appendChild(createTextCell("Phase 10!"));
		tr2.appendChild(createTextCell("Round 1"));
		t.players = [];
		t.scores = [];
		t.sums = [];
		t.round = 1;
		for(var i = 0; i < players; i++) {
			tr.appendChild(createTextCell(" "));
			(function(i){
				t.players[i] = "";
				var edit = new EditCell(function(name){
					t.players[i] = name;
				});
				tr.appendChild(edit.element);
			})(i);
			t.scores[i] = [];
			t.sums[i] = [];
			var score = new NumberCell();
			t.scores[i].push(score);
			t.sums[i].push(score);
			tr2.appendChild(createTextCell(""));
			tr2.appendChild(t.scores[i][0].element);
		}
		t.table.appendChild(tr);
		t.table.appendChild(tr2);
	}
	{
		var br = document.createElement("tr");
		var addbtn = document.createElement("input");
		addbtn.type = "button";
		addbtn.value = "Add Round";
		var bd = document.createElement("td");
		bd.appendChild(addbtn);
		br.appendChild(bd);
		t.table.appendChild(br);
		addbtn.addEventListener("click",function(){
			var r = t.round++;
			var tr = document.createElement("tr");
			var tr2 = document.createElement("tr");

			tr.appendChild(createTextCell("Round " + t.round));
			tr2.appendChild(createTextCell(""));

			for (var i = 0; i < players; i++) {
				var nc = new NumberCell();
				t.scores[i][r] = nc;
				tr.appendChild(createTextCell("+"));
				tr.appendChild(nc.element);
				var ns = new SumCell(t.scores[i][r], t.sums[i][r-1]);
				t.sums[i][r] = ns;
				tr2.appendChild(createTextCell(""));
				tr2.appendChild(ns.element);
			}
			t.table.insertBefore(tr, br);
			t.table.insertBefore(tr2,br);
		});
	}
	t.element.appendChild(t.table);
};

EditCell = function(onChange) {
	var t = this;
	t.element = document.createElement("td");
	t.edit = document.createElement("input");
	t.element.appendChild(t.edit);
	t.value = "";
	var change = function(){
		if(t.value !== t.edit.value) {
			t.value = t.edit.value;
			if (onChange) {
				onChange(t.value);
			}
		}
	};
	t.edit.addEventListener("change", change);
	t.edit.addEventListener("blur", change)
};

NumberCell = function() {
	var t = this;
	t.element = document.createElement("td");
	t.edit = document.createElement("input");
	t.element.appendChild(t.edit);
	t.changeListeners = [];
	t.value = 0;
	var change = function() {
		var num = validateNum(t.edit.value, true);
		if (num+1 && num != t.value) {
			t.value = num;
			for (var x in t.changeListeners) {
				if (t.changeListeners[x]) {
					t.changeListeners[x]();
				}
			}
		}
	};
	t.edit.addEventListener("change", change);
	t.edit.addEventListener("keyup", change);
	t.edit.addEventListener("blur", change);
}

NumberCell.prototype.addChangeListener = function(callback) {
	this.changeListeners.push(callback);
}

SumCell = function(source1, source2) {
	var t = this;
	t.s1 = source1;
	t.s2 = source2;

	t.value = t.s1.value + t.s2.value;

	t.element = document.createElement("td");
	t.element.innerHTML = t.value + "";

	t.changeListeners = [];

	var change = function() {
		var nval = t.s1.value + t.s2.value;
		if (nval != t.value) {
			t.value = nval;
			t.element.innerHTML = t.value + "";
			for (var x in t.changeListeners) {
				if (t.changeListeners[x]) {
					t.changeListeners[x]();
				}
			}
		}
	};

	t.s1.addChangeListener(change);
	t.s2.addChangeListener(change);
}

SumCell.prototype.addChangeListener = function(callback) {
	this.changeListeners.push(callback);
}

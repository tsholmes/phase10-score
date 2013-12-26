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

function createTextCell(str,leftBorder,bottomBorder) {
	var td = document.createElement("td");
	td.appendChild(document.createTextNode(str));
	if (leftBorder){
		td.style.borderLeft = "2px solid black";
	}
	if (bottomBorder){
		td.style.borderBottom = "2px solid black";
	}
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
	t.table.style.borderCollapse = "collapse";
	var addCheck = function(p,r) {
		var chk = document.createElement("input");
		var lbl = document.createTextNode("");
		chk.type = "checkbox";
		t.pcs[p][r] = chk;
		t.pls[p][r] = lbl;
		t.scores[p][r].element.appendChild(chk);
		t.scores[p][r].element.appendChild(lbl);
		chk.addEventListener("change",function(){
			var phase = 1;
			for(var i in t.pcs[p]) {
				if (t.pcs[p][i].checked) {
					t.pls[p][i].data = phase++;
				} else {
					t.pls[p][i].data = "";
				}
			}
			t.lls[p].data = phase;
		});
	};
	{
		var tr = document.createElement("tr");
		var tr2 = document.createElement("tr");
		tr.appendChild(createTextCell("Phase 10!"));
		tr2.appendChild(createTextCell("Round 1"));
		t.players = [];
		t.scores = [];
		t.sums = [];
		t.pcs = [];
		t.pls = [];
		t.lls = [];
		t.round = 1;
		tr.style.borderBottom = "2px solid black";
		for(var i = 0; i < players; i++) {
			tr.appendChild(createTextCell(" ",true));
			(function(i){
				t.players[i] = "";
				var edit = new EditCell(function(name){
					t.players[i] = name;
				});
				edit.edit.value = "Player " + (i + 1);
				tr.appendChild(edit.element);
				var lbl = document.createTextNode("1");
				t.lls[i] = lbl;
				edit.element.appendChild(lbl);
			})(i);
			t.scores[i] = [];
			t.sums[i] = [];
			t.pcs[i] = [];
			t.pls[i] = [];
			var score = new NumberCell();
			t.scores[i].push(score);
			t.sums[i].push(score);
			tr2.appendChild(createTextCell("", true));
			tr2.appendChild(t.scores[i][0].element);
			addCheck(i,0);
		}
		t.table.appendChild(tr);
		t.table.appendChild(tr2);
		t.sums[0][0].edit.style.fontWeight = "bold";
		t.sums[0][0].element.title = "Dealer";
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

			tr.appendChild(createTextCell("Round " + t.round, false, true));
			tr2.appendChild(createTextCell(""));

			for (var i = 0; i < players; i++) {
				var nc = new NumberCell();
				nc.element.style.borderBottom = "2px solid black";
				t.scores[i][r] = nc;
				tr.appendChild(createTextCell("+", true, true));
				tr.appendChild(nc.element);
				var ns = new SumCell(t.scores[i][r], t.sums[i][r-1]);
				t.sums[i][r] = ns;
				tr2.appendChild(createTextCell("", true));
				tr2.appendChild(ns.element);
				addCheck(i,r);
			}
			t.table.insertBefore(tr, br);
			t.table.insertBefore(tr2,br);

			t.sums[r%players][r].element.style.fontWeight = "bold";
			t.sums[r%players][r].element.title = "Dealer";
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
	t.edit.value = "0";
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



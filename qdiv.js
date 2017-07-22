'use strict';

// すべての問題を保持するシングルトン
var Qdiv = {
    // すべての問題
    min: 10, // 割られる数の範囲
    max: 100,
    all: [], // すべての問題

    // ランダムに選んだ問題
    count: 10, // 選択する数
    seed: 0, // 乱数のシード、0 なら自動（毎回変更）
    chance: null,
    picked: [],
    
    // すべての問題を生成
    init: function(min, max) {
	this.min = min; 
	this.max = max; 
	this.all = [];
	for(var num = min; num <= max; num++) {
	    var divs = this.divisors(num);
	    for(var idiv = 0; idiv < divs.length; idiv++) {
		var q = new Div(this.all.length, num, divs[idiv]);
		this.all.push(q);
	    }
	}
    },

    // 整数 num の約数のリストを得る。ただし 1 と自身は除く
    divisors: function(num) {
	var max = num / 2;
	var res = [];
	for(var i=2; i <= max; i++) {
	    var p = num / i;
	    if( Math.round(p) === p ) {
		res.push(i);
	    }
	}
	// console.log(num + ":" + res);
	return res;
    },

    getDiv: function(qid) {
	return this.all[qid];
    },
    
    pickup: function(seed, count) {
	this.seed = seed;
	this.count = count;
	var chance = (seed > 0) ? new Chance(seed) : new Chance();
	this.chance = chance;
	this.picked = chance.pickset(this.all, count) ;
	return this.picked;
    },

    dumpAll: function() {
	this.dump(this.picked);
    },

    dump: function(questions) {
	for(var i=0; i < questions.length; i++) {
	    var div = questions[i];
	    console.log(div.qid + ":" + div.num + "/" + div.div + "=" + (div.num/div.div));
	}
	console.log("total=" + questions.length);
    },
    
    createHtml: function(doc) {
	var h = "";
	h += "<table border='1'>\n" ;
	h += "  <tr>\n";
	h += "    <th>問題</th>\n";
	h += "    <th>採点</th>\n";
	h += "    <th>正解</th>\n";
	h += "  </tr>\n";

	for(var i=0; i < this.picked.length; i++) {
	    h += this.picked[i].createHtml(doc);
	}
	h += "</table>\n";
	return h;
    },

    checkIt: function(el) {
	var qid = parseInt(el.getAttribute('qid'));
	var ans = el.value.trim();
	var div = this.getDiv(qid);
	console.log("qid=" + qid + ",ans=" + ans + ",div=" + div);
	var elcheck = document.getElementById("check-" + qid);
	var elcorrect = document.getElementById("correct-" + qid);
	if(ans == "") {
	    elcheck.textContent = "";	
	    elcorrect.textContent = "";	
	} else {
	    elcorrect.textContent = div.correct;
	    if(parseInt(ans) == div.correct) {
		elcheck.textContent = "OK";
		document.getElementById("soundOK").play();
	    } else {
		elcheck.textContent = "OK";
		document.getElementById("soundNG").play();
	    }
	}
    }
}

class Div {
    constructor(qid, num, div) {
	this.qid = qid;
	this.num = num;
	this.div = div;
	this.check = 0;  // 1:OK, 0:not yet, -1:NG
	this.correct = num / div;
    }

    // 1問に対応する　<tr>....</tr> 文字列
    createHtml(doc) {
	var h = "";
	h += "<tr>";
	h += "  <td>\n";
	h += "    " + this.num + " &div; " + this.div + " = ";
	h += "<input type='number' qid='" + this.qid + "'" 
	    + " class='ans'" 
	    + " onchange='Qdiv.checkIt(this);' />\n";
	h += "    <td class='check' id='check-" + this.qid + "'></td>\n";
	h += "    <td class='correct' id='correct-" + this.qid + "'></td>\n";
	h += "</tr>\n";
	return h;
    }

}


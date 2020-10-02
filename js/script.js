
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function loadUrl() {
    if(getCookie('discordUrl') == null) setCookie('discordUrl', document.getElementById("discordUrl").value, 30);
}


function loadPg(){
    var array = document.getElementById('pgData').value.split(/\r?\n/);

    var pg = new Object();
    pgHealthArr = array[4].split("/");
    pgStats1 = array[6].split(")");
    pgStats2 = array[7].split(")");
    pg.name = array[0];
    pg.class = array[1];
    pg.proficiency = array[2].slice(-2);
    pg.ac = array[3].slice(-2);
    pg.nowHealth = pgHealthArr[0].replace( /^\D+/g, '');
    pg.maxHealth = pgHealthArr[1];
    pg.str = pgStats1[0].substring(5,7);
    pg.strMod = Math.floor((parseInt(pg.str)-10)/2);
    pg.dex = pgStats1[1].substring(6,8);
    pg.dexMod = Math.floor((parseInt(pg.dex)-10)/2);
    pg.con = pgStats1[2].substring(6,8);
    pg.conMod = Math.floor((parseInt(pg.con)-10)/2);
    pg.int = pgStats2[0].substring(5,7);
    pg.intMod = Math.floor((parseInt(pg.int)-10)/2);
    pg.wis = pgStats2[1].substring(6,8);
    pg.wisMod = Math.floor((parseInt(pg.wis)-10)/2);
    pg.cha = pgStats2[2].substring(6,8);
    pg.chaMod = Math.floor((parseInt(pg.cha)-10)/2);
    pg.saveProf = [];
    array[8].slice(-(array[8].length-19)).split(",").forEach(function(k){
        k = k.substring(1, k.length-3).replace(/\s/g, '');
        switch(k){
            case("Strength"): pg.saveProf.push("str"); break;
            case("Dexterity"): pg.saveProf.push("dex"); break;
            case("Constitution"): pg.saveProf.push("con"); break;
            case("Intelligence"): pg.saveProf.push("int"); break;
            case("Wisdom"): pg.saveProf.push("wis"); break;
            case("Charisma"): pg.saveProf.push("cha"); break;
        }
    });
    pg.skillProf = [];
    array[9].slice(-(array[9].length-20)).split(",").forEach(function(k){
        if(k.substring(k.length-4, k.length-1) == "adv") {
            k = k.substring(0, k.length-5);
        }
        k = k.substring(1, k.length-3).replace(/\s/g, '');
        pg.skillProf.push(k);
    });

    var jsonString= JSON.stringify(pg);

    //eraseCookie(pg.name);
    setCookie(pg.name, jsonString, 5);
    if(getCookie(pg.name)) console.log("Cookie saved");
    else (console.log("false"));

    console.log(JSON.parse(jsonString));
}    


function sendMessage(msg) {

    var discordUrl = getCookie("discordUrl");
    var request = new XMLHttpRequest();
    request.open("POST", discordUrl);

    //msg = "```bash \n".concat(msg).concat("\n ```");

    request.setRequestHeader('Content-type', 'application/json');

    var params = {
        username: "Tiradadi",
        avatar_url: "",
        content: msg
    }

    request.send(JSON.stringify(params));

    /*params.content = ""
    
    request.open("POST", "");

    request.setRequestHeader('Content-type', 'application/json');

    request.send(JSON.stringify(params));*/
}

function randD20(){
    //var e = document.getElementById("pgSelect");
    //var selPg = e.options[e.selectedIndex].value;
    let name = getCookie("selected");
    let rand = Math.floor(Math.random() * 20)+1;
    //let pg = JSON.parse(getCookie(selPg))
    //let name = pg.name;
    name="**`".concat(name).concat("`**");
    let mod = document.getElementById("d20mod").value;
    if(rand===21) rand=20;
    if(mod)
        rand += parseInt(mod);
    let msg = name.concat(" ha tirato un D20 ");
    if(mod != 0) msg = msg.concat("con modificatore ").concat(mod.toString()).concat(" ");
    msg = msg.concat("ottenendo ").concat(rand.toString()).concat(".");
    //console.log(msg);
    return msg;
}

function cfgSelect(){
    var pgSel = document.getElementById("pgSelect");
	var sel = document.createElement("select");
	$.each(document.cookie.split(/; */), function()  {
        var name = this.split('=');
        var text;
        name = name[0];
        console.log(name);
        if(name != "discordUrl" && name != "selected"){
            var o = new Option(name, name);
            $(o).html(name);
            $("#pgSelect").append(o);
        }
        /*var name = this.split('=');
        var text;
        name = name[0];
		console.log(name);
		if(name!="discordUrl") {
			sel = document.createElement("select");
            text = document.createTextNode(name);
			pgSel.appendChild(sel);
			sel.setAttribute("value", name);
			sel.appendChild(text);
		}*/
	});
}


function siteChangeSheet(){
    var e = document.getElementById("pgSelect");
    var selPg = e.options[e.selectedIndex].value;
    console.log("test");
    if(selPg == "newPg"){
        console.log("test3");
        window.open("index.html","_self")
    }else{
        console.log("test2");
        setCookie("selected", selPg, 1);
        window.open("sheet.html","_self");
    }	
}
function siteChangeIndex(){
    var e = document.getElementById("pgSelect");
    var selPg = e.options[e.selectedIndex].value;
    console.log("test");
    if(selPg != "newPg"){
        console.log("test2");
        setCookie("selected", selPg, 1);
        window.open("sheet.html","_self");
    }
}

function sheetPage(){
    sel = getCookie("selected");
    pg = getCookie(sel)[1];
    document.getElementById("name").innerHTML += pg.name;
}


/*Kravin Sanguemarcio
Goblin Blood Hunter 5
Proficiency Bonus: +3
AC: 18
HP: 20/46
Initiative: +5
STR: 13 (+1) DEX: 20 (+5) CON: 16 (+3)
INT: 19 (+4) WIS: 12 (+1) CHA: 10 (+0)
Save Proficiencies: Dexterity +8, Intelligence +7
Skill Proficiencies: Acrobatics +8, Insight +4, Investigation +7, Religion +7, Stealth +5 (adv), Survival +4
Senses: passive Perception 11
Attacks
Crossbow, Light: Attack: +8 to hit. Hit: 1d8+5 [piercing] damage.
Dagger: Attack: +8 to hit. Hit: 1d4+5 [piercing] damage.
Dart: Attack: +8 to hit. Hit: 1d4+5 [piercing] damage.
Rapier: Attack: +8 to hit. Hit: 1d8+5 [piercing] damage.
Rapier, +1: Attack: +9 to hit. Hit: 1d8+6 [magical piercing] damage.
Rifle, Hunting: Attack: +5 to hit. Hit: 2d10+5 [piercing] damage.
Unarmed Strike: Attack: +4 to hit. Hit: 2 [bludgeoning] damage.
*/

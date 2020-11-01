
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
    pg.joat = false; //jack of all trades, bard feature
    if(array[5].substring(11, array[5].length) > pg.dexMod) pg.joat = true;

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
    let rand = Math.floor(Math.random() * 20)+1;
    //let pg = JSON.parse(getCookie(selPg))
    //let name = pg.name;
    if(rand===21) rand=20;
    //console.log(msg);
    return rand;
}

function soloD20(){
    let pg = JSON.parse(getCookie(sel));
    let name = pg.name;
    name="**`".concat(name).concat("`**");
    let rand = randD20();
    let mod = document.getElementById("d20mod").value;
    let msg = name.concat(" ha tirato un D20 ");

    if(mod)
        rand += parseInt(mod);
    if(mod != 0) msg = msg.concat("con modificatore ").concat(mod.toString()).concat(" ");
    msg = msg.concat("ottenendo ").concat(rand.toString()).concat(".");

    return msg;
}

function checkD20(type){
    let pg = JSON.parse(getCookie(sel));
    let name = pg.name;
    name="**`".concat(name).concat("`**");
    let msg = name.concat(" ha tirato **");
    let rand = randD20();
    let typename = "";
    let mod = 0;

    switch(type){
        case "init":
            typename = "iniziativa";
            mod = pg.dexMod;
            if(pg.joat) mod += Math.floor(pg.proficiency/2);
            break;
        
        case "dex":
            typename = "destrezza";
            mod = pg.dexMod;
            break;
            
        case "dexSave":
            typename = "salvezza destrezza";
            mod = pg.dexMod;
            if(pg.saveProf.includes("dex")) mod = parseInt(mod)+parseInt(pg.proficiency);
            //else if (pg.joat)
            break;
        
        case "str":
            typename = "forza";
            mod = pg.strMod;
            break;

        case "strSave":
            typename = "salvezza forza";
            mod = pg.strMod;
            if(pg.saveProf.includes("str")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "con":
            typename = "costituzione";
            mod = pg.conMod;
            break;
            
        case "conSave":
            typename = "salvezza costituzione";
            mod = pg.conMod;
            if(pg.saveProf.includes("con")) mod = parseInt(mod)+parseInt(pg.proficiency);
            //else if (pg.joat)
            break;
        
        case "int":
            typename = "intelligenza";
            mod = pg.strMod;
            break;

        case "intSave":
            typename = "salvezza intelligenza";
            mod = pg.intMod;
            if(pg.saveProf.includes("int")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "wis":
            typename = "saggezza";
            mod = pg.wisMod;
            break;

        case "wisSave":
            typename = "salvezza saggezza";
            mod = pg.wisMod;
            if(pg.saveProf.include("wis")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "cha":
            typename = "carisma";
            mod = pg.chaMod;
            break;
    
        case "chaSave":
            typename = "salvezza carisma";
            mod = pg.chaMod;
            if(pg.saveProf.includes("cha")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
    

        case "acr":
            typename = "acrobazia";
            mod = pg.dexMod;
            if(pg.skillProf.includes("Acrobatics")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "anh":
            typename = "manipolazione animali";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Animal handling")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "arc":
            typename = "arcana";
            mod = pg.intMod;
            if(pg.skillProf.includes("Arcana")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;            

        case "ath":
            typename = "atletica";
            mod = pg.strMod;
            if(pg.skillProf.includes("Athletics")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "dec":
            typename = "inganno";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Deception")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "his":
            typename = "storia";
            mod = pg.intMod;
            if(pg.skillProf.includes("History")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "ins":
            typename = "intuito";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Insight")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "inm":
            typename = "intimidazione";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Intimidation")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "inv":
            typename = "investigazione";
            mod = pg.intMod;
            if(pg.skillProf.includes("Investigation")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "med":
            typename = "medicina";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Medicine")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "nat":
            typename = "natura";
            mod = pg.intMod;
            if(pg.skillProf.includes("Nature")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "pec":
            typename = "percezione";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Perception")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "pef":
            typename = "performance";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Performance")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "pes":
            typename = "persuasione";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Persuasion")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "rel":
            typename = "religione";
            mod = pg.intMod;
            if(pg.skillProf.includes("Religion")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "slh":
            typename = "velocità di mano";
            mod = pg.dexMod;
            if(pg.skillProf.includes("Sleight of hand")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;

        case "sth":
            typename = "stealth";
            mod = pg.dexMod;
            if(pg.skillProf.includes("Stealth")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
        case "sur":
            typename = "sopravvivenza";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Survival")) mod = parseInt(mod)+parseInt(pg.proficiency);
            break;
            
    }

    let tot = rand + mod;

    msg = msg.concat(typename).concat("** ottenendo **").concat(tot).concat("** (").concat(rand)
    if(mod>=0)
        msg = msg.concat(" + ").concat(mod).concat(").");
    else
        msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");

    sendMessage(msg);
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
    //console.log(sel);
    pg = JSON.parse(getCookie(sel));
    //console.log(pg);
    document.getElementById("name").innerHTML += pg.name;
    document.getElementById("class").innerHTML += pg.class;
    document.getElementById("ac").innerHTML += pg.ac;
    document.getElementById("hp").innerHTML += pg.nowHealth.concat("/").concat(pg.maxHealth);
    document.getElementById("init").value += pg.dexMod;
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

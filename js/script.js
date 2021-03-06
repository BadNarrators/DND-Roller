const hookName = "Dices&Dragons";

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
    pg.skillExp = [];
    array[9].slice(-(array[9].length-20)).split(",").forEach(function(k){
        //console.log(k.substring(k.length-10, k.length-1));
        if(k.substring(k.length-10, k.length-1) == "expertise"){
            k = k.substring(1, k.length-14).replace(/\s/g, '');
            pg.skillExp.push(k);
        }else{
            if(k.substring(k.length-4, k.length-1) == "adv") {
                k = k.substring(0, k.length-5);
            }
            k = k.substring(1, k.length-3).replace(/\s/g, '');
            pg.skillProf.push(k);
        }
    });
    pg.joat = false; //jack of all trades, bard feature
    if(array[1].substring((array[1].length)-2, array[1].length).replace(/\D/g, "") >= 2 && array[1].replace(/[0-9]/g, '').substring(array[1].length-4, array[1].length) == "Bard") pg.joat = true;
    
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
        username: hookName,
        avatar_url: "https://i.ytimg.com/vi/7yUR7d2cMF4/maxresdefault.jpg",
        content: msg
    }

    request.send(JSON.stringify(params));

    msg = msg.replace(/\*/g, "");
    //console.log(msg);
    document.getElementById("diceDiv").innerHTML = msg;

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
    let rand2;
    let adv = document.querySelector('input[name="adv"]:checked').value;
    if(adv != "nor") rand2 = randD20();
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
            else if(pg.skillExp.includes("Acrobatics")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "anh":
            typename = "manipolazione animali";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Animal handling")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Animal handling")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "arc":
            typename = "arcana";
            mod = pg.intMod;
            if(pg.skillProf.includes("Arcana")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Arcana")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;            

        case "ath":
            typename = "atletica";
            mod = pg.strMod;
            if(pg.skillProf.includes("Athletics")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Athletics")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "dec":
            typename = "inganno";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Deception")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Deception")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "his":
            typename = "storia";
            mod = pg.intMod;
            if(pg.skillProf.includes("History")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("History")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "ins":
            typename = "intuito";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Insight")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Insight")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "inm":
            typename = "intimidazione";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Intimidation")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Intimidation")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "inv":
            typename = "investigazione";
            mod = pg.intMod;
            if(pg.skillProf.includes("Investigation")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Investigation")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "med":
            typename = "medicina";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Medicine")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Medicine")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "nat":
            typename = "natura";
            mod = pg.intMod;
            if(pg.skillProf.includes("Nature")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Nature")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "pec":
            typename = "percezione";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Perception")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Perception")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "pef":
            typename = "performance";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Performance")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Performance")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "pes":
            typename = "persuasione";
            mod = pg.chaMod;
            if(pg.skillProf.includes("Persuasion")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Persuasion")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "rel":
            typename = "religione";
            mod = pg.intMod;
            if(pg.skillProf.includes("Religion")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Religion")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "sle":
            typename = "velocità di mano";
            mod = pg.dexMod;
            if(pg.skillProf.includes("Sleight of hand")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Sleight of hand")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;

        case "sth":
            typename = "stealth";
            mod = pg.dexMod;
            if(pg.skillProf.includes("Stealth")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Stealth")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
        case "sur":
            typename = "sopravvivenza";
            mod = pg.wisMod;
            if(pg.skillProf.includes("Survival")) mod = parseInt(mod)+parseInt(pg.proficiency);
            else if(pg.skillExp.includes("Survival")) mod = parseInt(mod)+parseInt(pg.proficiency*2);
            else if(pg.joat) mod = parseInt(mod)+parseInt(Math.floor(pg.proficiency/2));
            break;
            
    }
    if(adv == "adv") {
        if(rand2 > rand) {
            let tot = rand2 + mod;
            msg = msg.concat(typename).concat("** con *vantaggio* ottenendo **").concat(tot).concat("** (( ~~").concat(rand).concat("~~ )").concat(rand2);
            if(mod>=0)
                msg = msg.concat(" + ").concat(mod).concat(").");
            else
                msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");
        }else{
            let tot = rand + mod;
            msg = msg.concat(typename).concat("** con *vantaggio* ottenendo **").concat(tot).concat("** (( ~~").concat(rand2).concat("~~ )").concat(rand);
            if(mod>=0)
                msg = msg.concat(" + ").concat(mod).concat(").");
            else
                msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");
        }
    }else if(adv == "dis"){
        if(rand2 > rand) {
            let tot = rand + mod;
            msg = msg.concat(typename).concat("** con *svantaggio* ottenendo **").concat(tot).concat("** (( ~~").concat(rand2).concat("~~ )").concat(rand);
            if(mod>=0)
                msg = msg.concat(" + ").concat(mod).concat(").");
            else
                msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");
        }else{
            let tot = rand + mod;
            msg = msg.concat(typename).concat("** con *svantaggio* ottenendo **").concat(tot).concat("** (( ~~").concat(rand).concat("~~ )").concat(rand2);
            if(mod>=0)
                msg = msg.concat(" + ").concat(mod).concat(").");
            else
                msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");
        }
    }else{
        let tot = rand + mod;

        msg = msg.concat(typename).concat("** ottenendo **").concat(tot).concat("** (").concat(rand)
        if(mod>=0)
            msg = msg.concat(" + ").concat(mod).concat(").");
        else
            msg = msg.concat("  ").concat(Math.abs(mod)).concat(").");
    }
    
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

function plusAdd(val){
    if(val >= 0) return "+".concat(val);
    else return val;
}

function sheetPage(){
    sel = getCookie("selected");
    //console.log(sel);
    pg = JSON.parse(getCookie(sel));
    //console.log(pg);
    document.getElementById("name").innerHTML += pg.name;
    document.getElementById("class").innerHTML += pg.class;
    document.getElementById("ac").innerHTML += pg.ac;
    //document.getElementById("hp").innerHTML += pg.nowHealth.concat("/").concat(pg.maxHealth);
    document.getElementById("hpNow").innerHTML = pg.maxHealth;
    document.getElementById("hpMax").innerHTML = pg.maxHealth;
    //document.getElementById("hp").innerHTML = "HP: <input type='number' value='".concat(pg.maxHealth).concat("' style='width:40px'></input>").concat("/").concat(pg.maxHealth);
    document.getElementById("init").value += pg.dexMod;

    /*var div = document.getElementById("defChecks"),
        checks = div.getElementsByClassName("defCheck");
    for(var k = 0; k < checks.length; k++){
        var elem = checks[k];

    }*/

    document.getElementById("strDiv").innerHTML += pg.str; 
    document.getElementById("dexDiv").innerHTML += pg.dex;
    document.getElementById("conDiv").innerHTML += pg.con;
    document.getElementById("intDiv").innerHTML += pg.int;
    document.getElementById("wisDiv").innerHTML += pg.wis;
    document.getElementById("chaDiv").innerHTML += pg.cha;

    /*document.getElementById("str").value = "Strength check: ".concat(plusAdd(pg.strMod));
    document.getElementById("dex").value = "Dexterity check: ".concat(plusAdd(pg.dexMod));
    document.getElementById("con").value = "Constitution check: ".concat(plusAdd(pg.conMod));
    document.getElementById("int").value = "Intelligence check: ".concat(plusAdd(pg.intMod));
    document.getElementById("wis").value = "Wisdom check: ".concat(plusAdd(pg.wisMod));
    document.getElementById("cha").value = "Charisma check: ".concat(plusAdd(pg.chaMod));*/
    document.getElementById("str").value = plusAdd(pg.strMod);
    document.getElementById("dex").value = plusAdd(pg.dexMod);
    document.getElementById("con").value = plusAdd(pg.conMod);
    document.getElementById("int").value = plusAdd(pg.intMod);
    document.getElementById("wis").value = plusAdd(pg.wisMod);
    document.getElementById("cha").value = plusAdd(pg.chaMod);
    if(pg.saveProf.includes("str")) document.getElementById("strSave").value = plusAdd(parseInt(pg.strMod)+parseInt(pg.proficiency));
    else document.getElementById("strSave").value = plusAdd(pg.strMod);
    if(pg.saveProf.includes("dex")) document.getElementById("dexSave").value = plusAdd(parseInt(pg.dexMod)+parseInt(pg.proficiency));
    else document.getElementById("dexSave").value = plusAdd(pg.dexMod);
    if(pg.saveProf.includes("con")) document.getElementById("conSave").value = plusAdd(parseInt(pg.conMod)+parseInt(pg.proficiency));
    else document.getElementById("conSave").value = plusAdd(pg.conMod);
    if(pg.saveProf.includes("int")) document.getElementById("intSave").value = plusAdd(parseInt(pg.intMod)+parseInt(pg.proficiency));
    else document.getElementById("intSave").value = plusAdd(pg.intMod);
    if(pg.saveProf.includes("wis")) document.getElementById("wisSave").value = plusAdd(parseInt(pg.wisMod)+parseInt(pg.proficiency));
    else document.getElementById("wisSave").value = plusAdd(pg.wisMod);
    if(pg.saveProf.includes("cha")) document.getElementById("chaSave").value = plusAdd(parseInt(pg.chaMod)+parseInt(pg.proficiency));
    else document.getElementById("chaSave").value = plusAdd(pg.chaMod);

    var div = document.getElementById("skillChecks_Str"),
        subDiv = div.getElementsByClassName('skillCheckBtn'),
        myArray = [];
    for(var i = 0; i < subDiv.length; i++) {
        var elem = subDiv[i];
        var val = parseInt(pg.strMod);
        if(pg.skillProf.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency);
        }else if(pg.skillExp.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency)*2;
        }
        else if(pg.joat) val += Math.floor(parseInt(pg.proficiency)/2);
        if(val >= 0) val = "+".concat(val);
        elem.value = elem.value.concat(val);
    }
    div = document.getElementById("skillChecks_Dex"),
        subDiv = div.getElementsByClassName('skillCheckBtn'),
        myArray = [];
    for(var i = 0; i < subDiv.length; i++) {
        var elem = subDiv[i];
        var val = parseInt(pg.dexMod);
        if(pg.skillProf.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency);
        }else if(pg.skillExp.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency)*2;
        }else if(pg.joat) val += Math.floor(parseInt(pg.proficiency)/2);
        if(val >= 0) val = "+".concat(val);
        elem.value = elem.value.concat(val);
    }
    div = document.getElementById("skillChecks_Int"),
        subDiv = div.getElementsByClassName('skillCheckBtn'),
        myArray = [];
    for(var i = 0; i < subDiv.length; i++) {
        var elem = subDiv[i];
        var val = parseInt(pg.intMod);
        if(pg.skillProf.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency);
        }else if(pg.skillExp.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency)*2;
        }else if(pg.joat) val += Math.floor(parseInt(pg.proficiency)/2);
        if(val >= 0) val = "+".concat(val);
        elem.value = elem.value.concat(val);
    }
    div = document.getElementById("skillChecks_Wis"),
        subDiv = div.getElementsByClassName('skillCheckBtn'),
        myArray = [];
    for(var i = 0; i < subDiv.length; i++) {
        var elem = subDiv[i];
        var val = parseInt(pg.wisMod);
        if(pg.skillProf.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency);
        }else if(pg.skillExp.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency)*2;
        }else if(pg.joat) val += Math.floor(parseInt(pg.proficiency)/2);
        if(val >= 0) val = "+".concat(val);
        elem.value = elem.value.concat(val);
    }
    div = document.getElementById("skillChecks_Cha"),
        subDiv = div.getElementsByClassName('skillCheckBtn'),
        myArray = [];
    for(var i = 0; i < subDiv.length; i++) {
        var elem = subDiv[i];
        var val = parseInt(pg.chaMod);
        if(pg.skillProf.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency);
        }else if(pg.skillExp.includes(elem.id.charAt(0).toUpperCase().concat(elem.id.slice(1)))) {
            val += parseInt(pg.proficiency)*2;
        }else if(pg.joat) val += Math.floor(parseInt(pg.proficiency)/2);
        if(val >= 0) val = "+".concat(val);
        elem.value = elem.value.concat(val);
    }
}

function changeHP(type){
    let val = parseInt(document.getElementById("hpValue").value);
    let hp = parseInt(document.getElementById("hpNow").innerHTML);

    if(type == "dmg") val -= val*2;

    hp += val;

    if(hp > pg.maxHealth) hp = pg.maxHealth;

    document.getElementById("hpNow").innerHTML = hp;
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

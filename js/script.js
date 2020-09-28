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
    pg.dex = pgStats1[1].substring(5,7);
    pg.con = pgStats1[2].substring(5,7);
    pg.int = pgStats2[0].substring(5,7);
    pg.wis = pgStats2[1].substring(5,7);
    pg.cha = pgStats2[2].substring(5,7);

    var jsonString= JSON.stringify(pg);


    console.log(JSON.parse(jsonString));
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
Unarmed Strike: Attack: +4 to hit. Hit: 2 [bludgeoning] damage.*/

const defaults=[
["Counter-Strike 2",730],["Rust",252490],["Grand Theft Auto V",271590],["Terraria",105600],["Stardew Valley",413150],
["Euro Truck Simulator 2",227300],["Team Fortress 2",440],["Left 4 Dead 2",550],["Portal 2",620],["PAYDAY 2",218620],
["ARK: Survival Evolved",346110],["7 Days to Die",251570],["Dead by Daylight",381210],["Valheim",892970],["Palworld",1623730],
["Baldur's Gate 3",1086940],["Cyberpunk 2077",1091500],["The Witcher 3",292030],["Satisfactory",526870],["Project Zomboid",108600],
["Dota 2",570],["Apex Legends",1172470],["Warframe",230410],["Among Us",945360],["Hades",1145360],["Hollow Knight",367520],
["Subnautica",264710],["DayZ",221100],["Squad",393380],["Counter-Strike",10]
].map(x=>({name:x[0],id:String(x[1]),custom:false}));
let games=JSON.parse(localStorage.getItem("aim_games")||"null")||defaults;
let selected=new Set(JSON.parse(localStorage.getItem("aim_selected")||"[]").map(String));
const $=x=>document.getElementById(x), list=$("list"), search=$("search"), dlg=$("dlg");
function save(){localStorage.setItem("aim_games",JSON.stringify(games));localStorage.setItem("aim_selected",JSON.stringify([...selected]))}
function icon(id){return `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/header.jpg`}
function render(){
 let q=search.value.toLowerCase().trim(), arr=games.filter(g=>g.name.toLowerCase().includes(q)||g.id.includes(q));
 $("result").textContent=arr.length; $("count").textContent=selected.size;
 $("limit").classList.toggle("hidden",selected.size<32); list.innerHTML="";
 $("empty").classList.toggle("hidden",arr.length>0);
 arr.forEach(g=>{
  let row=document.createElement("div");row.className="game";
  row.innerHTML=`<input type="checkbox" ${selected.has(g.id)?"checked":""} ${!selected.has(g.id)&&selected.size>=32?"disabled":""}>
   <img class="icon" src="${icon(g.id)}" alt="" onerror="this.style.visibility='hidden'"><div class="info"><div class="name"></div><div class="appid">AppID ${g.id}</div></div>${g.custom?'<button class="remove">Usuń</button>':""}`;
  row.querySelector(".name").textContent=g.name;
  row.querySelector("input").onchange=e=>{if(e.target.checked){if(selected.size>=32){e.target.checked=false;toast("Maksymalnie 32 gry");return}selected.add(g.id)}else selected.delete(g.id);save();render()};
  let rm=row.querySelector(".remove");if(rm)rm.onclick=()=>{games=games.filter(x=>x!==g);selected.delete(g.id);save();render()};
  list.appendChild(row);
 });
 update();
}
function update(){
 let ids=[...selected], arr=ids.map(Number);
 $("param").textContent=`"GamesPlayedWhileIdle": [${ids.join(", ")}]`;
 $("json").textContent=JSON.stringify({GamesPlayedWhileIdle:arr},null,2);
 let c=$("chips");c.innerHTML=ids.length? "":"<span class='muted'>Brak wybranych gier</span>";
 ids.forEach(id=>{let g=games.find(x=>x.id===id),x=document.createElement("span");x.className="chip";x.textContent=(g?g.name:"AppID "+id);c.appendChild(x)})
}
function toast(t){let x=$("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1500)}
search.oninput=render;
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();search.focus()}});
$("selectVisible").onclick=()=>{let q=search.value.toLowerCase();games.filter(g=>g.name.toLowerCase().includes(q)||g.id.includes(q)).forEach(g=>{if(selected.size<32)selected.add(g.id)});save();render()};
$("clear").onclick=()=>{selected.clear();save();render()};
document.querySelectorAll("[data-copy]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText($(b.dataset.copy).textContent);toast("Skopiowano")}catch{toast("Schowek niedostępny")}});
$("add").onclick=()=>{ $("name").value="";$("id").value="";$("err").textContent="";dlg.showModal();$("name").focus()};
$("close").onclick=$("cancel").onclick=()=>dlg.close();
$("form").onsubmit=e=>{e.preventDefault();let name=$("name").value.trim(),id=$("id").value.trim();if(!/^\d+$/.test(id)){$("err").textContent="AppID musi być liczbą.";return}if(games.some(g=>g.id===id)){$("err").textContent="Ten AppID już istnieje.";return}games.push({name,id,custom:true});save();dlg.close();render();toast("Dodano grę")};
$("reset").onclick=()=>{if(confirm("Usunąć własne gry i wyczyścić wybór?")){games=defaults;selected.clear();save();render();toast("Zresetowano")}};
render();

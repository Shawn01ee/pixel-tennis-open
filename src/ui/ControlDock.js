// ControlDock — Auto, shot buttons, serve buttons and fast-forward
// Auto, the five shots (or, when serving, three serves and three targets), and fast-forward
class ControlDock{
  constructor(game){
    this.g=game;
    $('shots').innerHTML=SHOT_KEYS.map(([k,l,s,,kb])=>`<button class="shot" id="sh-${k}" aria-pressed="false" aria-keyshortcuts="${kb}"><span class="k">${l}<kbd>${kb}</kbd></span><small>${s}</small></button>`).join('');
    $('serves').innerHTML=SERVE_KEYS.map(([k,l,s,,kb])=>`<button class="shot" id="sv-${k}" aria-pressed="false" aria-keyshortcuts="${kb}"><span class="k">${l}<kbd>${kb}</kbd></span><small>${s}</small></button>`).join('')+
      '<span class="sep"></span>'+ZONE_KEYS.map(([k,l,,kb])=>`<button class="shot zone" id="zn-${k}" aria-pressed="false" aria-keyshortcuts="${kb}"><span class="k">${l}<kbd>${kb}</kbd></span><small>target</small></button>`).join('');
    for(const[k]of SHOT_KEYS)$('sh-'+k).onclick=()=>game.shot(k);
    for(const[k]of SERVE_KEYS)$('sv-'+k).onclick=()=>game.serve(k);
    for(const[k]of ZONE_KEYS)$('zn-'+k).onclick=()=>game.zone(k);
    $('auto').onclick=()=>game.toggleAuto();$('fast').onclick=()=>game.toggleFast();
  }
  serving(m){const H=m.human;return!!H&&!!m.cue&&m.cue.who===H.idx&&!m.live;}
  update(m){
    const C=m.control,H=m.human,on=(id,v)=>{const e=$(id);if(e&&e.getAttribute('aria-pressed')!==String(v))e.setAttribute('aria-pressed',String(v));};
    // once the match is over the shot buttons have nothing to do: the after-match bar takes their place
    $('dock').hidden=!H||!!m.result;if(!H||m.result)return;
    const sv=this.serving(m);$('shots').hidden=sv;$('serves').hidden=!sv;
    for(const[k]of SHOT_KEYS)on('sh-'+k,C.shot===k);
    for(const[k]of SERVE_KEYS)on('sv-'+k,C.serveType===k);
    for(const[k]of ZONE_KEYS)on('zn-'+k,C.zone===k);
    on('auto',C.auto);on('fast',this.g.speed===3);
    $('dock').classList.toggle('hot',!!(C.decide&&!C.auto&&!C.target)||!!(C.serveWait&&!C.auto));
  }
}

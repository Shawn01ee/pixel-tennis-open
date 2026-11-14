// InterviewScreen — asks the interview's questions one at a time and shows how the crowd takes each answer
class InterviewScreen{
  constructor(game){this.g=game;this.q=[];this.i=0;this.done=null;$('ivNext').onclick=()=>this.next();}
  // done(fans): called when the last answer has been given
  open(m,t,done){
    this.q=Interview.build(m,t);this.i=0;this.fans=0;this.done=done;
    $('ivWho').innerHTML=`${Portrait.img(m.human.st,'face big')}<div><b>${m.human.st.name}</b><span>On-court interview</span></div>`;
    this.show();$('interview').hidden=false;
  }
  show(){
    const q=this.q[this.i];$('ivQ').textContent=q.q;$('ivR').hidden=true;$('ivNext').hidden=true;
    $('ivA').innerHTML=q.options.map((o,k)=>`<button data-k="${k}"><small>${o.tone.toUpperCase()}</small>${o.text}</button>`).join('');
    $('ivA').querySelectorAll('button').forEach(b=>b.onclick=()=>this.answer(+b.dataset.k));
  }
  answer(k){
    const o=this.q[this.i].options[k];this.fans+=o.fans;
    $('ivA').querySelectorAll('button').forEach((b,j)=>{b.disabled=true;b.setAttribute('aria-pressed',String(j===k));});
    $('ivR').textContent=`${o.react}  +${o.fans}k fans`;$('ivR').hidden=false;
    if(this.g.sound.live&&this.g.sound.crowd.react)this.g.sound.crowd.react('applause',.5);
    $('ivNext').textContent=this.i<this.q.length-1?'Next question ▶':'Thank you ▶';$('ivNext').hidden=false;$('ivNext').focus();
  }
  next(){if(this.i<this.q.length-1){this.i++;this.show();}else{this.close();if(this.done)this.done(this.fans);}}
  close(){$('interview').hidden=true;}
}

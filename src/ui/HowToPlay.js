// HowToPlay — the controls, in the words of the device in hand: buttons and slides on a touch screen, keys and
// clicks on a computer. Shown as a card from the main menu, and beside the menu on a wide screen.
class HowToPlay{
  static TOUCH=[
    ['SHOTS','Hold Drive, Flat, Slice, Lob or Drop, slide to aim (the yellow cross follows), let go to hit'],
    ['TIMING','Let go while the bar ends in the bright green for Perfect: cleaner, a little faster, and tiredness does not show in it. Pale green is Good; too late is a mishit'],
    ['SLOW MOTION','The game slows while your shot is coming. Aiming ends it, so aim late or aim early: your call'],
    ['TAP THE COURT','Also aims: tap anywhere past the net'],
    ['SERVE','Tap Wide, Body or T to serve there, or hold Flat, Slice or Kick and slide into the box'],
    ['CHALLENGE','Tap the red prompt after a close call; three wrong ones per set'],
    ['AUTO','Your player picks every shot; tap again to take over'],
    ['CAMERA','Swipe across the court to turn it, pinch to zoom; View has the other cameras and quick walks between points'],
  ];
  static KEYS=[
    ['A S D F G','Pick the shot as the ball comes: drive, flat, slice, lob, drop'],
    ['Click','Aim it: the yellow cross, the circle shows how far it may stray. Or hold a shot button, slide and let go'],
    ['Timing','Press the shot key in the bright green of the bar for a Perfect hit'],
    ['1 2 3','Serve wide, body or T; A S D picks flat, slice or kick'],
    ['C','Challenge a close line call'],
    ['Space','Auto: your player chooses every shot'],
    ['V · Q E','Camera views · turn the court'],
    ['X · P · M','Fast-forward · pause · sound'],
  ];
  static html(touch=Prefs.touch){return(touch?HowToPlay.TOUCH:HowToPlay.KEYS).map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('');}
  constructor(game){this.g=game;$('howX').onclick=()=>this.close();}
  get on(){return!$('howto').hidden;}
  open(){$('howB').innerHTML=HowToPlay.html();$('howto').hidden=false;$('howX').focus();}
  close(){if(!this.on)return;$('howto').hidden=true;this.g.sfx('click');}
}

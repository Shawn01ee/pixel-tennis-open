// keymap — the DOM helper and the keys and labels for shots, serves and targets
const $=id=>document.getElementById(id);
const SHOT_KEYS=[['drive','Drive','topspin','KeyA','A'],['flat','Flat','pace','KeyS','S'],['slice','Slice','stays low','KeyD','D'],['lob','Lob','over them','KeyF','F'],['drop','Drop','dies short','KeyG','G']];
const SERVE_KEYS=[['flat','Flat','pace','KeyA','A'],['slice','Slice','swings wide','KeyS','S'],['kick','Kick','safe, high','KeyD','D']];
const ZONE_KEYS=[['wide','Wide','Digit1','1'],['body','Body','Digit2','2'],['t','T','Digit3','3']];
const WING={fh:'Forehand',bh:'Backhand',volley:'Volley',smash:'Smash'};

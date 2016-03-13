var ctx = new AudioContext();
var soundfont = new Soundfont(ctx);

const LEFT_HAND = 'left';
const RIGHT_HAND = 'right';

scales = {
    'C': ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
    'Bb': ['F3', 'G3', 'A3', 'Bb3' ,'C4','D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C45'],
    'BlackNotes': ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 'C#4', 'D#4', 'F#4'],
    'Ahm': ['A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G#3', 'A3', 'B3', 'C4'],
    'Cc': ['C2', 'E2', 'G2', 'C3', 'E3', 'G3', 'C4', 'E4', 'G4', ]
}

currentNotes = scales["C"];

/* Canvas viewer code */
var canvas = document.getElementById('viewer');
var ctx = canvas.getContext('2d');
ctx.strokeStyle = "#0033FF";

drawCircleForPosition = function(x, y) {
    var radius = 15;
    var halfRadius = radius / 2

    ctx.beginPath();
    ctx.arc(x - halfRadius, y - halfRadius, radius, 0, 2*Math.PI);
    ctx.lineWidth=10;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0,canvas.height/2);
    ctx.lineTo(canvas.width,canvas.height/2);
    ctx.lineWidth = 2;
    ctx.stroke();
}

var clearViewer = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function Instrument(name, notes) {
    this.instrument = soundfont.instrument(name);

    this.notes = notes;

    var lefthandLastIndex = -1;
    var righthandLastIndex = -1;

    var lastLefthandNote = null;
    var lastRighthandNote = null;

    this.playIndexWithHand = function(index, hand) {

        if (hand == LEFT_HAND && lefthandLastIndex != index) {
            lefthandLastIndex = index;

            if (lastLefthandNote)
                lastLefthandNote.stop(2);

            lastLefthandNote = this.instrument.play(this.notes[index], 0, -1);

        }

        if (hand == RIGHT_HAND && righthandLastIndex != index) {
            righthandLastIndex = index;

            if (lastRighthandNote)
                lastRighthandNote.stop();

            this.instrument.play(this.notes[index], 0, -1);
        }
    }

    this.playNoteAgainForHand = function (hand) {
        if (hand == LEFT_HAND) {
            lastLefthandNote = this.instrument.play(this.notes[this.lefthandLastIndex], 0, -1);
        } else if (hand == RIGHT_HAND) {
            lastRighthandNote = this.instrument.play(this.notes[this.righthandLastIndex], 0, -1);
        }

    }
}


var instrument_1 = new Instrument('acoustic_grand_piano', currentNotes);
var instrument_2 = new Instrument('acoustic_guitar_steel', currentNotes);


// hack because `soundfont.onready()` is not a function
loadingInst = soundfont.instrument('acoustic_grand_piano');


/* When user selects different instrument */
var inst_1_select = document.getElementById("inst-1");
inst_1_select.onchange = function(){
    instrument_1.instrument = soundfont.instrument(inst_1_select.options[inst_1_select.selectedIndex].value);
};

var inst_2_select = document.getElementById("inst-2");
inst_2_select.onchange = function(){
    instrument_2.instrument = soundfont.instrument(inst_2_select.options[inst_2_select.selectedIndex].value);
};

/* When user selects different scale/notes s*/
var scaleSelect = document.getElementById("scale");
scaleSelect.onchange = function(){
    var key = scaleSelect.options[scaleSelect.selectedIndex].value
    newScale = scales[key];

    currentNotes = newScale;
    instrument_1.notes = newScale;
    instrument_2.notes = newScale;

    /* Play a sample */
    instrument_1.instrument.play(newScale[0], 0);
    setTimeout(function(){ instrument_1.instrument.play(newScale[1], 0); }, 400);
    setTimeout(function(){ instrument_1.instrument.play(newScale[2], 0); }, 800);
};


var doAutoPlay = false;
var autoPlayLastIndex = -1;
var autoPlayNoteIndex = 0;
var autoPlayNotes = ['E3', 'E3', 'E3', 'C3', 'E3', 'G3', 'G2', 'C3', 'G3', 'E3', 'A3', 'B3', 'Bb3', 'A3', 'G3', 'E3', 'G3', 'A3', 'F3', 'G3', 'E3', 'C3', 'D3', 'B3', 'C3', 'C3', 'C3'];

var autoplayCheckbox = document.getElementById("autoplay-checkbox");
autoplayCheckbox.onclick = function(){
    doAutoPlay = autoplayCheckbox.checked;
};


loadingInst.onready(function() {

    var previousFrame = null;

    Leap.loop({enableGestures: true}, function(frame) {

        clearViewer();

        if (frame.hands.length > 0) {
            for (var i = 0; i < frame.hands.length; i++) {
                var hand = frame.hands[i];

                var numNotes = currentNotes.length;

                if (doAutoPlay) {
                    numNotes = 4;
                }

                // get a 'box' (1-d) where a note is played
                noteRange = frame.interactionBox.width / numNotes;

                x = hand.indexFinger.dipPosition[0];
                y = hand.indexFinger.dipPosition[1];


                drawCircleForPosition(x + (700/2), (y - 550) * -1);

                // based on finger location, get index to grab from the currentNotes
                index = Math.floor((x + (frame.interactionBox.width / 2)) / noteRange)


                if (!doAutoPlay) {

                    // select instrument based on height
                    var instrument;
                    if (y < 200) {
                        instrument = instrument_2;
                    } else {
                        instrument = instrument_1;
                    }

                    // play note if okay index
                    if (Math.abs(index) < currentNotes.length) {
                        instrument.playIndexWithHand(index, hand.type);
                    }

                    /* If a gesture occurs do this */
                    frame.gestures.forEach(function(gesture){
                        // if keytap, play same note again
                        if (gesture.type == "keyTap") {
                            instrument.playNoteAgainForHand(hand.type);
                        }
                    });

                } else {
                    if (autoPlayLastIndex != index) {
                        if (autoPlayNoteIndex >= autoPlayNotes.length)
                            autoPlayNoteIndex = 0;

                        autoPlayLastIndex = index;

                        instrument_1.instrument.play(autoPlayNotes[autoPlayNoteIndex], 0, -1);

                        autoPlayNoteIndex++;
                    }
                }
            }
        }
        previousFrame = frame;
    });
});

var ctx = new AudioContext();
var soundfont = new Soundfont(ctx);

const LEFT_HAND = 'left';
const RIGHT_HAND = 'right';

scales = {
    "C": ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'],
    "Bb": ['Bb2' ,'C3','Db3', 'Eb3', 'F3', 'Gb3', 'Ab3', 'Bb3', 'C4', 'Db4'],
    "BlackNotes": ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 'C#4', 'D#4', 'F#4'],
}

currentNotes = scales["C"];


function Instrument(name, notes) {
    this.instrument = soundfont.instrument(name);

    this.notes = notes;

    var lefthandLastIndex = -1;
    var righthandLastIndex = -1;

    var lastLefthandNote = null;

    var lastIndex = -1;

    this.playIndexWithHand = function(index, hand) {

        if (hand == LEFT_HAND && lefthandLastIndex != index) {
            lefthandLastIndex = index;

            if (lastLefthandNote)
                lastLefthandNote.stop(2);

            lastLefthandNote = this.instrument.play(this.notes[index], 0, -1);

        }

        if (hand == RIGHT_HAND && righthandLastIndex != index) {
            righthandLastIndex = index;
            this.instrument.play(this.notes[index], 0, -1);
        }

    }
}


var instrument_1 = new Instrument('acoustic_grand_piano', currentNotes);
var instrument_2 = new Instrument('acoustic_guitar_steel', currentNotes);



/* When user selects different instrument */
var inst_1_select = document.getElementById("inst-1");
inst_1_select.onchange = function(){
    console.log(inst_1_select.options[inst_1_select.selectedIndex].value);
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
};


var doAutoPlay = false;
var autoPlayLastIndex = -1;
var autoPlayNoteIndex = 0;
var autoPlayNotes = ['E3', 'E3', 'E3', 'C3', 'E3', 'G3', 'G2', 'C3', 'G3', 'E3', 'A3', 'B3', 'Bb3', 'A3', 'G3', 'E3', 'G3', 'A3', 'F3', 'G3', 'E3', 'C3', 'D3', 'B3', 'C3', 'C3', 'C3'];

var autoplayCheckbox = document.getElementById("autoplay-checkbox");
autoplayCheckbox.onclick = function(){
    doAutoPlay = autoplayCheckbox.checked;
};


// hack because `soundfont.onready()` is not a function
loadingInst = soundfont.instrument('acoustic_grand_piano');


loadingInst.onready(function() {

    var previousFrame = null;

    var controllerOptions = {
        enableGestures: true
    };


    Leap.loop(controllerOptions, function(frame) {

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

                    var hand = hand.type

                    if (Math.abs(index) < currentNotes.length) {
                        instrument.playIndexWithHand(index, hand);
                    }
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

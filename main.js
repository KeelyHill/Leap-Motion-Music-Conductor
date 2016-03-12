var ctx = new AudioContext();
var soundfont = new Soundfont(ctx);

const LEFT_HAND = 'left';
const RIGHT_HAND = 'right';

function Instrument(name, notes) {
    this.instrument = soundfont.instrument(name);

    this.notes = notes;

    // this.playing = {};
    // for (i = 0; i < this.notes.length; i++) {
    //     this.playing[this.notes[i]] = false;
    // }

    lefthandLastIndex = -1;
    righthandLastIndex = -1;

    lastIndex = -1;

    this.playIndexWithHand = function(index, hand) {
        // if (this.playing[this.notes[index]] === false || this.playing[this.notes[index]].done === true) {
        //     // console.log("play");
        //     this.playing[this.notes[index]] = this.instrument.play(this.notes[index], 0, -1);
        //     this.playing[this.notes[index]].onended = function() { this.done = true; }
        // }

        if (hand == LEFT_HAND && lefthandLastIndex != index) {
            lefthandLastIndex = index;
            this.instrument.play(this.notes[index], 0, -1);
        }

        if (hand == RIGHT_HAND && righthandLastIndex != index) {
            righthandLastIndex = index;
            this.instrument.play(this.notes[index], 0, -1);
        }

    }
}



// notes = ['C#3', 'D#3', 'F#3', 'G#3', 'A#3', 'C#3', 'D#3', 'F#3'];

// notes = ['E2' ,'G2','C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'E5'];

notes = ['Bb2' ,'C3','Db3', 'Eb3', 'F3', 'Gb3', 'Ab3', 'Bb3', 'C4', 'Db4'];

var piano = new Instrument('acoustic_grand_piano', notes);
var guitar = new Instrument('acoustic_guitar_nylon', notes);


// hack because `soundfont.onready()` is not a function
loadingInst = soundfont.instrument('acoustic_grand_piano');


loadingInst.onready(function() {

    var previousFrame = null;

    var controllerOptions = {
        enableGestures: true
    };


    Leap.loop(controllerOptions, function(frame)


        if (frame.hands.length > 0) {
            for (var i = 0; i < frame.hands.length; i++) {
                var hand = frame.hands[i];

                // get a 'box' (1-d) where a note is played
                noteRange = frame.interactionBox.width / notes.length;


                x = hand.indexFinger.dipPosition[0];
                y = hand.indexFinger.dipPosition[1];

                // based on finger location, get index to grab from the notes
                index = Math.floor((x + (frame.interactionBox.width / 2)) / noteRange)

                var instrument;
                if (y < 200) {
                    instrument = piano;
                } else {
                    instrument = guitar;
                }

                var hand = hand.type

                if (Math.abs(index) < notes.length) {
                    instrument.playIndexWithHand(index, hand);
                }
            }
        }
        previousFrame = frame;
    });
});

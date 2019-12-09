import magenta as mm;
const QPM = 120;
const STEPS_PER_QUARTER = 24;
const Z_DIM = 256;
const HUMANIZE_SECONDS = 0.01;
const MAX_PAN = 0.2;

const MIN_DRUM = 35;
const MAX_DRUM = 81;

const tf = mm.tf;

// Set up Multitrack MusicVAE.
const model = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/multitrack_fb256');

// Set up effects chain.
const globalCompressor = new mm.Player.tone.MultibandCompressor();
const globalReverb = new mm.Player.tone.Freeverb(0.25);
const globalLimiter = new mm.Player.tone.Limiter();

globalCompressor.connect(globalReverb);
globalReverb.connect(globalLimiter);
globalLimiter.connect(mm.Player.tone.Master);

// Set up per-program effects.
const programMap = new Map();
for (let i=0; i<128; i++) {
  const programCompressor = new mm.Player.tone.Compressor();
  const pan = 2 * MAX_PAN * Math.random() - MAX_PAN;
  const programPanner = new mm.Player.tone.Panner(pan);
  programMap.set(i, programCompressor);
  programCompressor.connect(programPanner);
  programPanner.connect(globalCompressor);
}

// Set up per-drum effects.
const drumMap = new Map();
for (let i=MIN_DRUM; i<=MAX_DRUM; i++) {
  const drumCompressor = new mm.Player.tone.Compressor();
  const pan = 2 * MAX_PAN * Math.random() - MAX_PAN;
  const drumPanner = new mm.Player.tone.Panner(pan);
  drumMap.set(i, drumCompressor);
  drumCompressor.connect(drumPanner);
  drumPanner.connect(globalCompressor);
}

// Set up SoundFont player.
const player = new mm.SoundFontPlayer('https://storage.googleapis.com/download.magenta.tensorflow.org/soundfonts_js/sgm_plus', globalCompressor, programMap, drumMap);

// Get UI elements.
const statusDiv = document.getElementById('status');
const playButton = document.getElementById('play');
const sampleButton1 = document.getElementById('sample1');
const sampleButton2 = document.getElementById('sample2');
const importButton1 = document.getElementById('import1');
const importButton2 = document.getElementById('import2');
const alphaSlider = document.getElementById('alpha');
const playInterpButton = document.getElementById('playInterp');
const saveButton = document.getElementById('download');

const numSteps = 5//+alphaSlider.max + 1;

// Declare style / sequence variables.
var z1, z2;
var seqs;
var interpSeq;

var playing = false;

// Sample a latent vector.
function generateSample(doneCallback) {
  const z = tf.randomNormal([1, Z_DIM]);
  z.data().then(zArray => {
    z.dispose();
    doneCallback(zArray);
  });
}

// Randomly adjust note times.
function humanize(s) {
  const seq = mm.sequences.clone(s);
  seq.notes.forEach((note) => {
    let offset = HUMANIZE_SECONDS * (Math.random() - 0.5);
    if (seq.notes.startTime + offset < 0) {
      offset = -seq.notes.startTime;
    }
    if (seq.notes.endTime > seq.totalTime) {
      offset = seq.totalTime - seq.notes.endTime;
    }
    seq.notes.startTime += offset;
    seq.notes.endTime += offset;
  });
  return seq;
}

// Construct spherical linear interpolation tensor.
function slerp(z1, z2, n) {
  const norm1 = tf.norm(z1);
  const norm2 = tf.norm(z2);
  const omega = tf.acos(tf.matMul(tf.div(z1, norm1),
                                  tf.div(z2, norm2),
                                  false, true));
  const sinOmega = tf.sin(omega);
  const t1 = tf.linspace(1, 0, n);
  const t2 = tf.linspace(0, 1, n);
  const alpha1 = tf.div(tf.sin(tf.mul(t1, omega)), sinOmega).as2D(n, 1);
  const alpha2 = tf.div(tf.sin(tf.mul(t2, omega)), sinOmega).as2D(n, 1);
  const z = tf.add(tf.mul(alpha1, z1), tf.mul(alpha2, z2));
  return z;
}

// Concatenate multiple NoteSequence objects.
function concatenateSequences(seqs) {
  const seq = mm.sequences.clone(seqs[0]);
  let numSteps = seqs[0].totalQuantizedSteps;
  for (let i=1; i<seqs.length; i++) {
    const s = mm.sequences.clone(seqs[i]);
    s.notes.forEach(note => {
      note.quantizedStartStep += numSteps;
      note.quantizedEndStep += numSteps;
      seq.notes.push(note);
    });
    numSteps += s.totalQuantizedSteps;
  }
  seq.totalQuantizedSteps = numSteps;
  return seq;
}

// Interpolate the two styles.
function interpolateSamples(doneCallback) {
  const z1Tensor = tf.tensor2d(z1, [1, Z_DIM]);
  const z2Tensor = tf.tensor2d(z2, [1, Z_DIM]);
  const zInterp = slerp(z1Tensor, z2Tensor, numSteps);

  model.decode(zInterp, undefined, undefined, STEPS_PER_QUARTER)
    .then(sequences => {
      seqs = sequences;
      const seq = concatenateSequences(seqs);
      const mergedSeq = mm.sequences.mergeInstruments(seq);
      interpSeq = mm.sequences.unquantizeSequence(mergedSeq);

      interpSeq.ticksPerQuarter = STEPS_PER_QUARTER;

      setLoadingState();
      player.loadSamples(interpSeq)
        .then(doneCallback);
    });
}

// Encode a MIDI file.
function encodeMIDIFile(file, doneCallback, failCallback) {
  var reader = new FileReader();
  reader.onerror = e => {
    failCallback('Unable to read MIDI file.');
  }
  reader.onload = e => {
    var seq;
    try {
      seq = mm.midiToSequenceProto(reader.result);
    } catch(e) {
      failCallback('Unable to parse MIDI file.');
      return;
    }

    var quantizedSeq;
    try {
      quantizedSeq = mm.sequences.quantizeNoteSequence(seq, STEPS_PER_QUARTER);
    } catch(e) {
      failCallback('Unable to quantize MIDI file, possibly due to tempo or time signature changes.');
      return;
    }

    const quartersPerBar = 4 *  quantizedSeq.timeSignatures[0].numerator / quantizedSeq.timeSignatures[0].denominator;
    if (quartersPerBar !== 4) {
      failCallback('Time signatures other than 4/4 not supported.');
      return;
    }

    if (quantizedSeq.totalQuantizedSteps > 4 * STEPS_PER_QUARTER) {
      failCallback('Imported MIDI file must be a single bar.');
      return;
    }

    model.encode([quantizedSeq])
      .then(z => {
        z.data().then(zArray => {
          z.dispose();
          doneCallback(zArray);
        });
      });
  }

  reader.readAsBinaryString(file);
}



// Set UI state to updating styles.
function setUpdatingState() {
  statusDiv.innerText = 'Updating arrangements...';
  controls.setAttribute('disabled', true);
}

// Set UI state to updating instruments.
function setLoadingState() {
  statusDiv.innerText = 'Loading samples...';
  controls.setAttribute('disabled', true);
}

// Set UI state to playing.
function setStoppedState() {
  statusDiv.innerText = 'Ready to play!';
  statusDiv.classList.remove('loading');
  controls.removeAttribute('disabled');
  slideControls.removeAttribute('disabled');
  playButton.innerText = 'Play';
  playInterpButton.innerText = 'Play full interpolation';
  playInterpButton.disabled = false;
  playButton.disabled = false;
  saveButton.disabled = false;
}

// Set UI state to playing.
function setPlayingState() {
  statusDiv.innerText = 'Move the slider to interpolate between styles.';
  playButton.innerText = 'Stop';
  playInterpButton.disabled = true;
}

// Set UI state to playing the whole interpolation.
function setPlayingInterpState() {
  statusDiv.innerText = 'Playing...';
  slideControls.setAttribute('disabled', true);
  playButton.disabled = true;
  saveButton.disabled = true;
  playInterpButton.disabled = false;
  playInterpButton.innerText = 'Stop';
}

// Play the interpolated sequence for the current slider position.
function playIdx(idx, doneCallback) {
  const unquantizedSeq = mm.sequences.unquantizeSequence(seqs[idx]);
  player.start(humanize(unquantizedSeq))
    .then(doneCallback);
}

// Play the current position until stopped.
function play() {
  const idx = alphaSlider.value;
  playIdx(idx, play);
}

// Play the interpolated sequence.
function playInterp(idx, doneCallback) {
  if (idx === numSteps) {
    doneCallback();
  } else {
    alphaSlider.value = idx;
    playIdx(idx, () => playInterp(idx + 1, doneCallback));
  }
}

// Toggle playing the entire interpolated sequence.
function togglePlayingInterp() {
  mm.Player.tone.context.resume();

  if (playing) {
    playing = false;
    setStoppedState();
    player.stop();
  } else {
    playing = true;
    setPlayingInterpState();
    playInterp(0, setStoppedState);
  }
}

// Update the start style.
function updateSample1() {
  playing = false;
  setUpdatingState();
  player.stop();
  setTimeout(() => {
    generateSample(z => {
      z1 = z;
      interpolateSamples(setStoppedState);
    });
  }, 0);
}

// Update the end style.
function updateSample2() {
  playing = false;
  setUpdatingState();
  player.stop();
  setTimeout(() => {
    generateSample(z => {
      z2 = z;
      interpolateSamples(setStoppedState);
    });
  }, 0);
}

// Import the start style from MIDI.
function importSample1() {
  if (import1.value.length === 0) {
    return;
  }

  playing = false;
  setUpdatingState();
  player.stop();
  filename = import1.files[0];
  setTimeout(() => {
    encodeMIDIFile(filename, z => {
      z1 = z;
      interpolateSamples(setStoppedState);
    }, (errorMessage) => {
      setStoppedState();
      statusDiv.innerText = errorMessage;
      statusDiv.style.color = 'red';
    });
  }, 0);
}

// Import the end style from MIDI.
function importSample2() {
  if (import2.value.length === 0) {
    return;
  }

  playing = false;
  setUpdatingState();
  player.stop();
  filename = import2.files[0];
  setTimeout(() => {
    encodeMIDIFile(filename, z => {
      z2 = z;
      interpolateSamples(setStoppedState);
    }, (errorMessage) => {
      setStoppedState();
      statusDiv.innerText = errorMessage;
      statusDiv.style.color = 'red';
    });
  }, 0);
}

// Save sequence as MIDI.
function saveSequence() {
  const midi = mm.sequenceProtoToMidi(interpSeq);
  const file = new Blob([midi], {type: 'audio/midi'});

  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(file, 'interp.mid');
  } else { // Others
    const a = document.createElement('a');
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'interp.mid';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

// Start or stop playing the sequence at the current slider position.
function togglePlaying() {
  mm.Player.tone.context.resume();

  if (playing) {
    playing = false;
    setStoppedState();
    player.stop();
  } else {
    playing = true;
    setPlayingState();
    play();
  }
}

sampleButton1.onclick = updateSample1;
sampleButton2.onclick = updateSample2;
playButton.onclick = togglePlaying;
playInterpButton.onclick = togglePlayingInterp;
saveButton.onclick = saveSequence;

import1.onchange = importSample1;
import2.onchange = importSample2;

model.initialize()
  .then(() => {
    setUpdatingState();
    setTimeout(() => {
      generateSample(z => {
        z1 = z;
        generateSample(z => {
          z2 = z;
          interpolateSamples(setStoppedState);
        });
      });
    }, 0);
  });

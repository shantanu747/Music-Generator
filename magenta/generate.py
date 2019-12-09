
#print(torch.exp(_)) # the predicted probability pying checkpoint from GCS. This will take less than a minute...')
# This will download the mel_2bar_big checkpoint. There are more checkpoints that you
# can use with this model, depending on what kind of output you want
# See the list of checkpoints: https://github.com/tensorflow/magenta/tree/master/magenta/models/music_vae#pre-trained-checkpoints
#!gsutil -q -m cp -R gs://download.magenta.tensorflow.org/models/music_vae/colab2/checkpoints/mel_2bar_big.ckpt.* /content/

# Import dependencies.
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
import collections
import sys
import tempfile
from magenta.music import constants
import pretty_midi
import six
from google.colab import files
import magenta.music as mm
import magenta
import tensorflow as tf
from magenta.models.music_vae import configs
from magenta.models.music_vae.trained_model import TrainedModel
from magenta.protobuf import music_pb2

def midi_to_note_sequence(midi_data):
  """Convert MIDI file contents to a NoteSequence.
  Converts a MIDI file encoded as a string into a NoteSequence. Decoding errors
  are very common when working with large sets of MIDI files, so be sure to
  handle MIDIConversionError exceptions.
  Args:
    midi_data: A string containing the contents of a MIDI file or populated
        pretty_midi.PrettyMIDI object.
  Returns:
    A NoteSequence.
  Raises:
    MIDIConversionError: An improper MIDI mode was supplied.
  """
  # In practice many MIDI files cannot be decoded with pretty_midi. Catch all
  # errors here and try to log a meaningful message. So many different
  # exceptions are raised in pretty_midi.PrettyMidi that it is cumbersome to
  # catch them all only for the purpose of error logging.
  # pylint: disable=bare-except
  if isinstance(midi_data, pretty_midi.PrettyMIDI):
    midi = midi_data
  else:
    try:
      midi = pretty_midi.PrettyMIDI(six.BytesIO(midi_data))
    except:
      raise MIDIConversionError('Midi decoding error %s: %s' %
                                (sys.exc_info()[0], sys.exc_info()[1]))
  # pylint: enable=bare-except
  sequence = music_pb2.NoteSequence()
  # Populate header.
  sequence.ticks_per_quarter = midi.resolution
  sequence.source_info.parser = music_pb2.NoteSequence.SourceInfo.PRETTY_MIDI
  sequence.source_info.encoding_type = (
      music_pb2.NoteSequence.SourceInfo.MIDI)
  # Populate time signatures.
  for midi_time in midi.time_signature_changes:
    time_signature = sequence.time_signatures.add()
    time_signature.time = midi_time.time
    time_signature.numerator = midi_time.numerator
    try:
      # Denominator can be too large for int32.
      time_signature.denominator = midi_time.denominator
    except ValueError:
      raise MIDIConversionError('Invalid time signature denominator %d' %
                                midi_time.denominator)
  # Populate key signatures.
  for midi_key in midi.key_signature_changes:
    key_signature = sequence.key_signatures.add()
    key_signature.time = midi_key.time
    key_signature.key = midi_key.key_number % 12
    midi_mode = midi_key.key_number // 12
    if midi_mode == 0:
      key_signature.mode = key_signature.MAJOR
    elif midi_mode == 1:
      key_signature.mode = key_signature.MINOR
    else:
      raise MIDIConversionError('Invalid midi_mode %i' % midi_mode)
  # Populate tempo changes.
  tempo_times, tempo_qpms = midi.get_tempo_changes()
  for time_in_seconds, tempo_in_qpm in zip(tempo_times, tempo_qpms):
    tempo = sequence.tempos.add()
    tempo.time = time_in_seconds
    tempo.qpm = tempo_in_qpm
  # Populate notes by gathering them all from the midi's instruments.
  # Also set the sequence.total_time as the max end time in the notes.
  midi_notes = []
  midi_pitch_bends = []
  midi_control_changes = []
  for num_instrument, midi_instrument in enumerate(midi.instruments):
    for midi_note in midi_instrument.notes:
      if not sequence.total_time or midi_note.end > sequence.total_time:
        sequence.total_time = midi_note.end
      midi_notes.append((midi_instrument.program, num_instrument,
                         midi_instrument.is_drum, midi_note))
    for midi_pitch_bend in midi_instrument.pitch_bends:
      midi_pitch_bends.append(
          (midi_instrument.program, num_instrument,
           midi_instrument.is_drum, midi_pitch_bend))
    for midi_control_change in midi_instrument.control_changes:
      midi_control_changes.append(
          (midi_instrument.program, num_instrument,
           midi_instrument.is_drum, midi_control_change))
  for program, instrument, is_drum, midi_note in midi_notes:
    note = sequence.notes.add()
    note.instrument = instrument
    note.program = program
    note.start_time = midi_note.start
    note.end_time = midi_note.end
    note.pitch = midi_note.pitch
    note.velocity = midi_note.velocity
    note.is_drum = is_drum
  for program, instrument, is_drum, midi_pitch_bend in midi_pitch_bends:
    pitch_bend = sequence.pitch_bends.add()
    pitch_bend.instrument = instrument
    pitch_bend.program = program
    pitch_bend.time = midi_pitch_bend.time
    pitch_bend.bend = midi_pitch_bend.pitch
    pitch_bend.is_drum = is_drum
  for program, instrument, is_drum, midi_control_change in midi_control_changes:
    control_change = sequence.control_changes.add()
    control_change.instrument = instrument
    control_change.program = program
    control_change.time = midi_control_change.time
    control_change.control_number = midi_control_change.number
    control_change.control_value = midi_control_change.value
    control_change.is_drum = is_drum
  # TODO(douglaseck): Estimate note type (e.g. quarter note) and populate
  # note.numerator and note.denominator.
  return sequence

twinkle_twinkle = music_pb2.NoteSequence()
#Add the notes to the sequence.
twinkle_twinkle.notes.add(pitch=60, start_time=0.0, end_time=0.5, velocity=80)
twinkle_twinkle.notes.add(pitch=60, start_time=0.5, end_time=1.0, velocity=80)
twinkle_twinkle.notes.add(pitch=67, start_time=1.0, end_time=1.5, velocity=80)
twinkle_twinkle.notes.add(pitch=67, start_time=1.5, end_time=2.0, velocity=80)
twinkle_twinkle.notes.add(pitch=69, start_time=2.0, end_time=2.5, velocity=80)
twinkle_twinkle.notes.add(pitch=69, start_time=2.5, end_time=3.0, velocity=80)
twinkle_twinkle.notes.add(pitch=67, start_time=3.0, end_time=4.0, velocity=80)
twinkle_twinkle.notes.add(pitch=65, start_time=4.0, end_time=4.5, velocity=80)
twinkle_twinkle.notes.add(pitch=65, start_time=4.5, end_time=5.0, velocity=80)
twinkle_twinkle.notes.add(pitch=64, start_time=5.0, end_time=5.5, velocity=80)
twinkle_twinkle.notes.add(pitch=64, start_time=5.5, end_time=6.0, velocity=80)
twinkle_twinkle.notes.add(pitch=62, start_time=6.0, end_time=6.5, velocity=80)
twinkle_twinkle.notes.add(pitch=62, start_time=6.5, end_time=7.0, velocity=80)
twinkle_twinkle.notes.add(pitch=60, start_time=7.0, end_time=8.0, velocity=80)
twinkle_twinkle.total_time = 8

twinkle_twinkle.tempos.add(qpm=60);

# This is a colab utility method that visualizes a NoteSequence.
#mm.plot_sequence(twinkle_twinkle)

# This is a colab utility method that plays a NoteSequence.
#mm.play_sequence(twinkle_twinkle,synth=mm.fluidsynth)


# Here's another NoteSequence!
teapot = music_pb2.NoteSequence()
teapot.notes.add(pitch=69, start_time=0, end_time=0.5, velocity=80)
teapot.notes.add(pitch=71, start_time=0.5, end_time=1, velocity=80)
teapot.notes.add(pitch=73, start_time=1, end_time=1.5, velocity=80)
teapot.notes.add(pitch=74, start_time=1.5, end_time=2, velocity=80)
teapot.notes.add(pitch=76, start_time=2, end_time=2.5, velocity=80)
teapot.notes.add(pitch=81, start_time=3, end_time=4, velocity=80)
teapot.notes.add(pitch=78, start_time=4, end_time=5, velocity=80)
teapot.notes.add(pitch=81, start_time=5, end_time=6, velocity=80)
teapot.notes.add(pitch=76, start_time=6, end_time=8, velocity=80)
teapot.total_time = 8

teapot.tempos.add(qpm=60);

#mm.plot_sequence(teapot)
#mm.play_sequence(teapot,synth=mm.synthesize)
# Initialize the model.
print("Initializing Music VAE...")
music_vae = TrainedModel(
      configs.CONFIG_MAP['cat-mel_2bar_big'],
      batch_size=4,
      checkpoint_dir_or_path='mel_2bar_big.ckpt')

print('🎉 Done!')

generated_sequences = music_vae.sample(n=2, length=80, temperature=1.0)

for ns in generated_sequences:
  # print(ns)
  #mm.plot_sequence(ns)
  #mm.play_sequence(ns, synth=mm.fluidsynth)

  # We're going to interpolate between the Twinkle Twinkle Little Star
  # NoteSequence we defined in the first section, and one of the generated
  # sequences from the previous VAE example

  # How many sequences, including the start and end ones, to generate.
  num_steps = 8;

  # This gives us a list of sequences.
  note_sequences = music_vae.interpolate(
        twinkle_twinkle,
        teapot,
        num_steps=num_steps,
        length=32)

  # Concatenate them into one long sequence, with the start and
  # end sequences at each end.
  interp_seq = mm.sequences_lib.concatenate_sequences(note_sequences)

  #mm.play_sequence(interp_seq, synth=mm.fluidsynth)
  #mm.plot_sequence(interp_seq)

  mm.sequence_proto_to_midi_file(interp_seq, 'interp_seq.mid')
  files.download('interp_seq.mid')

# pylint: enable=g-import-not-at-top
# Allow pretty_midi to read MIDI files with absurdly high tick rates.
# Useful for reading the MAPS dataset.
# https://github.com/craffel/pretty-midi/issues/112
pretty_midi.pretty_midi.MAX_TICK = 1e10
# The offset used to change the mode of a key from major to minor when
# generating a PrettyMIDI KeySignature.
_PRETTY_MIDI_MAJOR_TO_MINOR_OFFSET = 12
midi_to_note_sequence('toto-africa.mid')
class MIDIConversionError(Exception):
  pass

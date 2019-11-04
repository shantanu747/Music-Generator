
#print(torch.exp(_)) # the predicted probability pying checkpoint from GCS. This will take less than a minute...')
# This will download the mel_2bar_big checkpoint. There are more checkpoints that you
# can use with this model, depending on what kind of output you want
# See the list of checkpoints: https://github.com/tensorflow/magenta/tree/master/magenta/models/music_vae#pre-trained-checkpoints
#!gsutil -q -m cp -R gs://download.magenta.tensorflow.org/models/music_vae/colab2/checkpoints/mel_2bar_big.ckpt.* /content/

# Import dependencies.
from google.colab import files 
import magenta.music as mm
import magenta
import tensorflow
from magenta.models.music_vae import configs
from magenta.models.music_vae.trained_model import TrainedModel
from magenta.protobuf import music_pb2

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

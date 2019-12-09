"""
Algorithm based on the paper 'Automatic Chord Recognition from
Audio Using Enhanced Pitch Class Profile' by Kyogu Lee
This script computes 12 dimensional chromagram for chord detection
@author ORCHISAMA
"""

"""Create pitch profile template for 12 major and 12 minor chords and save them in a json file
Gmajor template = [1,0,0,0,1,0,0,1,0,0,0,0] - needs to be run just once"""

import json
import os

template = dict()
major = ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#']
minor = ['Gm', 'G#m', 'Am', 'A#m', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m']
sev7 = ['G7', 'G#7', 'A7', 'A#7', 'B7', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7']
maj7 = ['GM7', 'G#M7', 'AM7', 'A#M7', 'BM7', 'CM7', 'C#M7', 'DM7', 'D#M7', 'EM7', 'FM7', 'F#M7']
min7 = ['Gm7', 'G#m7', 'Am7', 'A#m7', 'Bm7', 'Cm7', 'C#m7', 'Dm7', 'D#m7', 'Em7', 'Fm7', 'F#m7']
offset = 0

# initialise lists with zeros
for chord in range(12):
    template[major[chord]] = list()
    template[minor[chord]] = list()
    template[sev7[chord]] = list()
    template[maj7[chord]] = list()
    template[min7[chord]] = list()
    for note in range(12):
        template[major[chord]].append(0)
        template[minor[chord]].append(0)
        template[sev7[chord]].append(0)
        template[maj7[chord]].append(0)
        template[min7[chord]].append(0)

for chord in range(12):
    for note in range(12):
        if note == 0 or note == 7:
            template[major[chord]][(note + offset) % 12] = 1
            template[minor[chord]][(note + offset) % 12] = 1
            template[sev7[chord]][(note + offset) % 12] = 0.6
            template[maj7[chord]][(note + offset) % 12] = 1
            template[min7[chord]][(note + offset) % 12] = 1
        elif note == 4:
            template[major[chord]][(note + offset) % 12] = 1
            template[maj7[chord]][(note + offset) % 12] = 1
            template[sev7[chord]][(note + offset) % 12] = 0.6

        elif note == 3:
            template[minor[chord]][(note + offset) % 12] = 1
            template[min7[chord]][(note + offset) % 12] = 1
        elif note == 10:
            template[sev7[chord]][(note + offset) % 12] = 0.6
            template[min7[chord]][(note + offset) % 12] = 1
        elif note == 11:
            template[maj7[chord]][(note + offset) % 12] = 1
    offset += 1

# debugging
for key, value in template.items():
    print(key, value)

# save as JSON file
with open('chord_templates.json', 'w') as fp:
    json.dump(template, fp, sort_keys=False)
    print('Saved succesfully to JSON file')

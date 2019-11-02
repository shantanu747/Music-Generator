from __future__ import division
import json
import os
from scipy.io.wavfile import read
import numpy as np
from chromagram import compute_chroma
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker

chords = ['N', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#',
          'Gm', 'G#m', 'Am', 'A#m', 'Bm', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m']
         # 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7']
# 'GM7', 'G#M7', 'AM7', 'A#M7', 'BM7', 'CM7', 'C#M7', 'DM7', 'D#M7', 'EM7', 'FM7', 'F#M7',
# 'Gm7', 'G#m7', 'Am7', 'A#m7', 'Bm7', 'Cm7', 'C#m7', 'Dm7', 'D#m7', 'Em7', 'Fm7', 'F#m7']


notes = ['G', 'G', 'G', 'G', 'G', 'G#', 'G#', 'G#', 'G#', 'G#', 'A', 'A', 'A', 'A', 'A',
         'A#', 'A#', 'A#', 'A#', 'A#', 'B', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C', 'C',
         'C#', 'C#', 'C#', 'C#', 'C#', 'D', 'D', 'D', 'D', 'D', 'D#', 'D#', 'D#', 'D#', 'D#',
         'E', 'E', 'E', 'E', 'E', 'F', 'F', 'F', 'F', 'F', 'F#', 'F#', 'F#', 'F#', 'F#']

bNotes = ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#']

def monoConversion(s, split):
    # Split the wav file, make it smaller
    splitS = s[::split]
    # Save both channels individually
    x = splitS[:, 0]
    y = splitS[:, 1]
    # Average them
    data_M = np.array([x, y])
    mono = np.average(data_M, axis=0)
    return mono

#Creates JSON "chord_templates.json" is the default
def readJSONChords(chordT='chord_templates.json'):
    print(chordT)
    with open(chordT, 'r') as fp:
        templates_json = json.load(fp)
    return templates_json

# Takes in JSON
def createChordTemplate(templatetemp):
    template = []
    for chord in chords:
        if chord == 'N':
            continue
        template.append(templatetemp[chord])
    return template


class EPCP:

    def __init__(self, dir="/test_chords/", file="Grand Piano - Fazioli - major A middle.wav",
                 split=6, NFFT=16384, hop_size=1024):
        # Informational data: directory, file name,
        self.directory = os.getcwd() + dir
        self.fname = file
        (self.fs, self.s) = read(self.directory + file)  # getcwd() == get Current Working Directory
        self.FS = self.fs  #preserves the original sample rate frequency/s
        self.fs = int(self.fs / split)  #converts to split sample rate (how small we converted the sample)

        # Parameters, but be reasonable when choosing, because these will increase or decrease the window-size analysis
        #       Perhaps a fix would be dealing with how many bpms a song is, and being able to calculate that
        self.nfft = NFFT #Defualt 16384, but can be values: 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8
        self.hopSize = hop_size #Default 1024, but values can be the same as listed above

        # Data
        monoTemp = monoConversion(self.s, split) #down samples the audio file, then converts it into mono
        self.nFrames = int(np.round(len(monoTemp) / (self.nfft - self.hopSize))) #Calculates the amount of windows. the sum of nFrames would be the whole song

        #Setting up Data Structures
        self.MONO = np.append(monoTemp, np.zeros(self.nfft)) #saves the mono audio data and creates a array size nfft
        self.id_chord = np.zeros(self.nFrames, dtype='int32') #holds indexes of the found chords
        self.timestamp = np.zeros(self.nFrames) #Time in song

        self.TIME = [] #holds the relevant Chroma date to display
    def displayData(self):
        n = []
        frq = 5
        for i in range(len(self.TIME)):
            n = n + notes
        cMax = 0
        for T in self.TIME:
            print(T)


        #when nFrame == 2 then width == 10
        #when nFrame = 14 then...
        dPlt = []
        c_count = [0]
        max_f = 0
        for T in range(len(self.TIME)):
            print(T)
            max_t = np.max(T)
            if(max_f < max_t):
                max_f == max_t
            for i in range(len(self.TIME[T])):
                for j in range(frq):
                    dPlt.append(self.TIME[T][i])
            c_count.append(c_count[T] + (12 * frq))
        plt.figure(1, (2.5 * self.nFrames, 5))
        plt.tick_params('both')
        plt.yticks(np.arange(0, 8500, 100))
            #c_count.append(c_countc_count+= (12 * frq )
        for cc in c_count:
            plt.axvline(cc)
        mTicks = np.arange(0, len(dPlt))
        plt.xticks(mTicks[::frq], n[::frq])

        plt.plot(dPlt, 'ro')
        plt.title('Pitch Class Profile')
        plt.xlabel('Note')
        plt.ylabel('Frequency')
        plt.grid(True)

        # h            plt.plot(self.timestamp, self.id_chord)z_line = np.array([40 for i in range(len(TIME[0]))])
        # plt.plot(TIME[0], hz_line, 'r--')
        dataFullBar = np.zeros(len(chords))
        for c in self.id_chord:
            dataFullBar[c] += 1
        dataBar = []
        labelBar = []
        for dB in range(len(dataFullBar)):
            if dataFullBar[dB] != 0:
                dataBar.append(dataFullBar[dB])
                labelBar.append(chords[dB])
        plt.figure(2, (10, 15))
        print(self.id_chord)
        plt.bar(np.arange(len(dataBar)), dataBar, align='center')
        plt.xticks(np.arange(len(dataBar)), labelBar)
        plt.yticks(np.arange(0, 30, 6))
        #plt.plot(self.timestamp, self.id_chord, 'bo')
        plt.ylabel('Times appeared')
        plt.xlabel('Chords')
        plt.title('Identified chords')
        plt.grid(True)
        plt.show()

    def frameByFrame(self, jName='chord_templates.json'):
        tempJSON = readJSONChords(jName)
        templates = createChordTemplate(tempJSON)
        start = 0
        chroma = np.empty((12, self.nFrames))
        xFrame = np.empty((self.nfft, self.nFrames))
        max_cor = np.zeros(self.nFrames)
        print('Time(s)', 'Chord')
        for n in range(self.nFrames):
            xFrame[:, n] = self.MONO[start:start + self.nfft]
            start = start + self.nfft - self.hopSize
            self.timestamp[n] = n * (self.nfft - self.hopSize) / self.fs
            chroma[:, n] = compute_chroma(xFrame[:, n], self.fs)

            self.TIME.append(chroma[:, n])

            """Correlate 12D chroma vector with each of 24 major and minor chords"""
            # +1 7th
            cor_vec = np.zeros(24)
            for ni in range(24):
                cor_vec[ni] = np.correlate(chroma[:, n], np.array(templates[ni]))
                # print("CHORD", chords[ni + 1], "  Cor:", cor_vec[ni])
            # print("CHROMA")
            # print(chroma[:, n])
            # print(" ")
            max_cor[n] = np.max(cor_vec)
            iMax = np.argmax(cor_vec) + 1
            self.id_chord[n] = iMax
            # print(max_cor[n], "    ", chords[id_chord[n]])

    # if max_cor[n] < threshold, then no chord is played
    # might need to change threshold value
    # id_chord[np.where(max_cor[n] < 0.80 * np.max(max_cor))] = 0
        for n in range(self.nFrames):
            if max_cor[n] > 0.80 * np.max(max_cor):
                self.id_chord[n] = 0  #This maps to N == NO CHORD
            #else:
            #    ++self.id_chord[n]
        for n in range(self.nFrames):
            print(self.timestamp[n], chords[self.id_chord[n]])

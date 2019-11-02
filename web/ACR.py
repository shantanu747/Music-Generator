############################################################################################################################
####                                                                                                                   #####
####    Based on the paper 'Automatic Chord Recognition from Audio Using Enhance Pitch Class Profile' by Kyogu Lee     #####
####                                                                                                                   #####
####    https://pdfs.semanticscholar.org/30a9/0af7c214f423743472e0c82f2b5332ccb55f.pdf                                 #####
####    Original Code: https://github.com/orchidas/Chord-Recognition by Orchisama Das                                  #####
####                                                                    https://ccrma.stanford.edu/~orchi/             #####
####                                                                                                                   #####
####    Currently trying to improve: Matthew Carlson, October 25th - OnGoing                                           #####
####                                                                                                                   #####
####    As originally stated in the code, the script computes a 12-d chromagram for chord detection                    #####
###     My changes have been mostly structural converting the original match_templates into setupEPCP and using it     #####
####    with a class structure. This is because we can use this base script to be able to render results from          #####
####    the Enhanced Pitch Class Profile technique

############################################################################################################################


import setupEPCP as ds
#x = ds.EPCP(file="Lofi_02.wav")
x = ds.EPCP(file="Grand Piano - Fazioli - major D# middle.wav")
#x = ds.EPCP(file='09.wav')
x.frameByFrame()
x.displayData()
print(x.nFrames)

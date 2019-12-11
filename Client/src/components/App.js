import React from 'react';
import Main from "./modules/Main";
import {BrowserRouter as Router, Route} from "react-router-dom";
import styled from "styled-components";
import sample from "../assets/songs/sample.mid";
import {Midi} from '@tonejs/midi';
import {parse} from "@fortawesome/fontawesome-svg-core";
import Async from "react-async";

let AD = "";
//Testing Server side Midi files for easier data  retrieval
async function findMidi(){
     AD = await Midi.fromUrl(new URL(sample.slice(1), document.baseURI));
     return AD;
}
//Irrelevant for now, but when we get the backend working it may become useful
const everyNote = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B,'.repeat(20).split(',').map( function(x,i) {
        return x + '' + Math.floor(i/12);
    });
function toMidi(note) {
        return everyNote.indexOf(note);
    }
//Main Function This is the child of the root basically
function App() {
    const home = () =>(
        <Async promiseFn={findMidi}>
            <Async.Pending>
                Loading...
            </Async.Pending>
            <Async.Fulfilled>
                {AD=> <Main songList={AD.toJSON()} songs={[MELODY1, MELODY2]}/>}
            </Async.Fulfilled>
            <Async.Rejected>
                {error => <p>{error.message}</p>}
            </Async.Rejected>
        </Async>
    );
    //Random Default music Generated by hand
    //Good way to represent the Melody
    const MELODY1 = {
  notes: [
    {pitch: 60, startTime: 0.0, endTime: 0.5},
    {pitch: 60, startTime: 0.5, endTime: 1.0},
    {pitch: 67, startTime: 1.0, endTime: 1.5},
    {pitch: 67, startTime: 1.5, endTime: 2.0},
    {pitch: 69, startTime: 2.0, endTime: 2.5},
    {pitch: 69, startTime: 2.5, endTime: 3.0},
    {pitch: 67, startTime: 3.0, endTime: 4.0},
    {pitch: 65, startTime: 4.0, endTime: 4.5},
    {pitch: 65, startTime: 4.5, endTime: 5.0},
    {pitch: 64, startTime: 5.0, endTime: 5.5},
    {pitch: 64, startTime: 5.5, endTime: 6.0},
    {pitch: 62, startTime: 6.0, endTime: 6.5},
    {pitch: 62, startTime: 6.5, endTime: 7.0},
    {pitch: 60, startTime: 7.0, endTime: 8.0},
  ],
  totalTime: 8
};
    const MELODY2 = { notes: [
        {pitch: 50, quantizedStartStep: 0, quantizedEndStep: 1},
        {pitch: 53, quantizedStartStep: 1, quantizedEndStep: 2},
        {pitch: 58, quantizedStartStep: 2, quantizedEndStep: 3},
        {pitch: 58, quantizedStartStep: 3, quantizedEndStep: 4},
        {pitch: 58, quantizedStartStep: 4, quantizedEndStep: 5},
        {pitch: 53, quantizedStartStep: 5, quantizedEndStep: 6},
        {pitch: 53, quantizedStartStep: 6, quantizedEndStep: 7},
        {pitch: 53, quantizedStartStep: 7, quantizedEndStep: 8},
        {pitch: 52, quantizedStartStep: 8, quantizedEndStep: 9},
        {pitch: 55, quantizedStartStep: 9, quantizedEndStep: 10},
        {pitch: 60, quantizedStartStep: 10, quantizedEndStep: 11},
        {pitch: 60, quantizedStartStep: 11, quantizedEndStep: 12},
        {pitch: 60, quantizedStartStep: 12, quantizedEndStep: 13},
        {pitch: 60, quantizedStartStep: 13, quantizedEndStep: 14},
        {pitch: 60, quantizedStartStep: 14, quantizedEndStep: 15},
        {pitch: 52, quantizedStartStep: 15, quantizedEndStep: 16},
        {pitch: 57, quantizedStartStep: 16, quantizedEndStep: 17},
        {pitch: 57, quantizedStartStep: 17, quantizedEndStep: 18},
        {pitch: 57, quantizedStartStep: 18, quantizedEndStep: 19},
        {pitch: 65, quantizedStartStep: 19, quantizedEndStep: 20},
        {pitch: 65, quantizedStartStep: 20, quantizedEndStep: 21},
        {pitch: 65, quantizedStartStep: 21, quantizedEndStep: 22},
        {pitch: 57, quantizedStartStep: 22, quantizedEndStep: 23},
        {pitch: 57, quantizedStartStep: 23, quantizedEndStep: 24},
        {pitch: 57, quantizedStartStep: 24, quantizedEndStep: 25},
        {pitch: 57, quantizedStartStep: 25, quantizedEndStep: 26},
        {pitch: 62, quantizedStartStep: 26, quantizedEndStep: 27},
        {pitch: 62, quantizedStartStep: 27, quantizedEndStep: 28},
        {pitch: 65, quantizedStartStep: 28, quantizedEndStep: 29},
        {pitch: 65, quantizedStartStep: 29, quantizedEndStep: 30},
        {pitch: 69, quantizedStartStep: 30, quantizedEndStep: 31},
        {pitch: 69, quantizedStartStep: 31, quantizedEndStep: 32}
    ]};

    const AppMain = styled.div`
          font-family: Arial, Helvetica, sans-serif;
            height: 100%;
            margin: 0;
            padding: 0;
    `;

  return (
        <Router>
            <Route render={({location, history}) => (
                <React.Fragment>
                    <AppMain>
                        <Route path='/' component={home}/>
                    </AppMain>


                </React.Fragment>
            )}
            />
        </Router>
  );
}

export default App;
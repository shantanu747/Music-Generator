import React from 'react';
import styled from "styled-components";
import * as mv from '@magenta/music';
import * as core from '@magenta/music/node/core';
import {BrowserRouter as Router, Route} from "react-router-dom";
import {saveAs} from 'file-saver';
import Async from "react-async";
import Main from "./Main";
import SongList from "../utilities/SongList";
    // set vae temperature
const vae_temperature = 1.5;
let mSamples;
let MaxSongs = []
let currentPlaying = null;
let First = true;
export default class Magenta extends React.Component {
    constructor(props) {
        super(props);
        this.checkpoint = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_small_q2';
        this.model = new mv.MusicVAE(this.checkpoint);

        this.player = new core.Player();
        this.state = {
            allSongs: [],
            ready: false
        };
        this.update = this.update.bind(this);

        this.newSong = false;
        //Testing multiple files
        // MaxSongs.push({"song1": new Blob([this.props.m1[1]], {type: 'audio/midi'})});
        // MaxSongs.push({"song1": new Blob([this.props.m1[1]], {type: 'audio/midi'})});
        // MaxSongs.push({"song1": new Blob([this.props.m1[1]], {type: 'audio/midi'})});
        // MaxSongs.push({"song1": new Blob([this.props.m1[1]], {type: 'audio/midi'})});
    }
    update(){
        this.setState({allSongs: MaxSongs});

    }

    componentDidMount = () => {
        console.log("Got Model", this.model);
        console.log("Got player", this.player);
        this.model
            .initialize()
            .then(() => {

                // play with temperature passed in
                //this.playVAE(vae_temperature);
                console.log("Started Model");
            })

    };
    saveSequence = (midiT) =>{
        const midi = mv.sequenceProtoToMidi(midiT);
        const file = new Blob([midi], {type: 'audio/midi'});
        saveAs(file, 'blob.midi');
    };
    interpolateInput = () =>{
        if(this.state.ready){
            let M = this.state.allSongs;
            if(M.length == 2){
                this.playInterpolation(M[0].file, M[1].file, vae_temperature);
                console.log("2 Files");
            }else{
                   this.playInterpolation4(M[0].file, M[1].file, M[2].file, M[3].file, vae_temperature);
                   console.log("4 files");
            }
        }
    };
    //Plays the interpolations between the
    playInterpolation = (M1, M2, vae_temperature) =>{
        //Steps per Quarter parameterMachine pre
      const m1 = mv.sequences.quantizeNoteSequence(M1, 4);
      const m2 = mv.sequences.quantizeNoteSequence(M2, 4);

      this.model
          .interpolate([m1, m2], 4, vae_temperature)
          /*.then((sample) =>{
             const concat = mv.sequences.concatenate(sample);
              this.player.start(concat);*/
          .then(sample =>{
              const concat = mv.sequences.concatenate(sample);
              currentPlaying = concat;
              this.saveSequence(concat);
              this.player.start(concat);
        });
    };
    playStop = () =>{
        if(currentPlaying != null) {
            if (this.player.isPlaying()) {
                this.player.stop();
            } else {
                this.player.start(currentPlaying);
            }
        }
    };
        //Plays the interpolations between the
    playInterpolation4 = (M1, M2, M3, M4, vae_temperature) =>{
        //Steps per Quarter parameterMachine pre
      const m1 = mv.sequences.quantizeNoteSequence(M1, 24);
      const m2 = mv.sequences.quantizeNoteSequence(M2, 24);
      const m3 = mv.sequences.quantizeNoteSequence(M3, 24);
      const m4 = mv.sequences.quantizeNoteSequence(M4, 24);

      this.model
          .interpolate([m1, m2, m3, m4], 4, vae_temperature)
          /*.then((sample) =>{
             const concat = mv.sequences.concatenate(sample);
              this.player.start(concat);*/
          .then(sample =>{
              const concat = mv.sequences.concatenate(sample);
              currentPlaying = concat;
              this.saveSequence(concat);
              this.player.start(concat);
        });
    };

    encodeMidi =(f)=> {
        //let newSong = new Blob([f], {type: 'audio/midi'});
        let newSong = URL.createObjectURL(f);
        return mv.urlToBlob(newSong);

    };
        handleChange(e){
            let Promises = [];
            let FinalPromise = [];
            if(e.target.files.length === 0){
                console.log("Need to have files chose");
                return;
            }
            let tempSongs = e.target.files;
            if(tempSongs.length >= 2){
                MaxSongs = [];
                for(let i = 0; i < tempSongs.length; i+=1){
                    MaxSongs.push({id: i, name: tempSongs[i].name, file: null});
                    Promises.push(this.encodeMidi(tempSongs[i], i));

                }
                Promise.all(Promises).then( e => {
                    for(let i = 0; i < tempSongs.length; i+=1) {
                        FinalPromise.push(mv.blobToNoteSequence(e[i]));
                    }
                    Promise.all(FinalPromise).then(f => {
                    for(let i = 0; i < tempSongs.length; i += 1){
                        MaxSongs[i] = ({id: i, name: MaxSongs[i].name, file: f[i]});
                        this.setState({allSongs: MaxSongs, ready: true});
                    }
                    //this.playInterpolation(MaxSongs[0].file, MaxSongs[1].file, vae_temperature);
                });
                });
            }
            // let filename = e.target.files[0];
            // setTimeout(()=>{
            //     console.log(this.encodeMidi(filename));
            // }, 0);
    };
    render() {
        const Button = styled.button`
              background-color: #00A0EE;
              border: none;
              color: white;
              padding: 15px 32px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
        `;
        return (<div>
                <div className={"input"}>
                    <form id={"file-uploader"} action={"/action_page.php"}>
                        <input id={"file-input"} type={"file"} multiple={"multiple"} name={"img"} onChange={this.handleChange.bind(this)} />
                            </form>
                    <SongList songs={this.state.allSongs}/>

                    </div>
                <div>
                    <Button onClick={this.interpolateInput} >
                    Generator
                </Button>
                <Button onClick={this.playStop}>
                    Play / Stop
                </Button>
                </div>
            </div>
        );
    }
}
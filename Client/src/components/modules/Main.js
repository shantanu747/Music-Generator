import React from 'react';
import Generator from "./Generator"
import styled from "styled-components";
import ShowFiles from "../utilities/ShowFiles";
import ajax from 'ajax';
import request from 'superagent';
import {Midi} from '@tonejs/midi'
import Async from "react-async";
import {BrowserRouter as Router, Route} from "react-router-dom";

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.ListofSongs = props.songs;
    }

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
        const Form = styled.form`
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
        `;
        const Header = styled.header`
            background-color: #150C48;
            padding: 30px;
            text-align: center;
            font-size: 35px;
            color: #E0C600;
        `;
        const Row = styled.div`
            height: 76vh;
            display: grid;
            grid-template-columns: 70% 30%;
        `;
        const Column1 = styled.div`
              height: 100%; /* Should be removed. Only for demonstration */
              color: white;
              background-color: #078EA3;
            padding: 0px 52px 0px 34px;
        `;
        const Column2 = styled.div`
              height: 100%; /* Should be removed. Only for demonstration */
              color: white;
              background-color: #047a8c;
        `;
        const Files = () =>(
        <Async promiseFn={this.compMount()}>
            <Async.Pending>
                Loading...
            </Async.Pending>
            <Async.Fulfilled>
                FOUND!
            </Async.Fulfilled>
            <Async.Rejected>
                {error => <p>{error.message}</p>}
            </Async.Rejected>
        </Async>
    );
        return (
            <div>
                <Header>
                    <h2>AITunes</h2>
                </Header>
                <Row>
                    <Column1>
                        <div>
                            Input Audio Files
                        </div>
                        <Generator m1={this.ListofSongs}/>
                    </Column1>
                    <Column2>
                    </Column2>
                </Row>

            </div>
        );
    }
};
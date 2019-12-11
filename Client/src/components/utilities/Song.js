import React from "react";
import styled from "styled-components";

function Song(props){
        const Button = styled.button`
              background-color: #00A0EE;
              color: white;
              display: inline-block;
              font-size: 16px;
              width: 98%;
              height: 10vh;
              cursor: pointer;
        `;
    return (<li className="song">
    <Button>{props.name}</Button>
    </li>);
}
export default Song;
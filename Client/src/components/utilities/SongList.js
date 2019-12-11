import React from "react";
import Song from "./Song";
import styled from "styled-components";
function SongList(props) {

    const InputD = styled.div`
              background-color: white;
              height: 52vh;      
              font-size: 25px;
              overflow-y: scroll;
              color: white;
              
             
        `;
    return (<InputD id={"input-display"}>
                Your Files:
                <ul>
                    {(props.songs || []).map(c => <Song key={c.id} name={c.name}/>)}
                </ul>
            </InputD>
    );
}

export default SongList;
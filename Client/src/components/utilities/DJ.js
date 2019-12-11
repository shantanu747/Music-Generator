import * as React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {
  usePopupState,
  bindTrigger,
  bindMenu,
} from 'material-ui-popup-state/hooks'
import styled from "styled-components";

const DJ = () => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'demoMenu' });
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
          const DJBooth = {
              left: '0px',
              right: '10%',
          };
  return (
    <div>
      <Button variant="contained" {...bindTrigger(popupState)}>
        Open Menu
      </Button>
      <Menu style={DJBooth} {...bindMenu(popupState)}>
        <MenuItem onClick={popupState.close}>Cake</MenuItem>
        <MenuItem onClick={popupState.close}>Death</MenuItem>
      </Menu>
    </div>
  )
};

export default DJ;
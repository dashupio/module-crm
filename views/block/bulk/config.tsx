
// import react
import React from 'react';
import { FormControl, FormControlLabel, Switch } from '@dashup/ui';

// block list
const BlockBlockConfig = (props = {}) => {

  // on sms
  const onSMS = (e) => {
    // on background
    props.setBlock(props.block, 'disableSMS', !e.target.checked);
  };

  // on sms
  const onEmail = (e) => {
    // on background
    props.setBlock(props.block, 'disableEmail', !e.target.checked);
  };

  // return jsx
  return (
    <>
      <FormControl fullWidth>
        <FormControlLabel control={ (
          <Switch defaultChecked={ !props.block.disableEmail } onChange={ (e) => onEmail } />
        ) } label="Enable Email" />
      </FormControl>
      <FormControl fullWidth>
        <FormControlLabel control={ (
          <Switch defaultChecked={ !props.block.disableSMS } onChange={ (e) => onSMS } />
        ) } label="Enable SMS" />
      </FormControl>
    </>
  );
}

// export default
export default BlockBlockConfig;
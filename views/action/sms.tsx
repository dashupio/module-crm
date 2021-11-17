
// import react
import React from 'react';
import { TextField, Link } from '@dashup/ui';

// create event action
const ActionSMS = (props = {}) => {

  // return jsx
  return (
    <>
      <TextField
        title="SMS Recipients(s)"
        value={ props.action.to || '' }
        onChange={ (e) => props.setAction(props.action, 'to', e.target.value) }
        helperText="Seperate with ,"
        fullWidth
      />
      <TextField
        title="SMS From Name"
        value={ props.action.from || '' }
        onChange={ (e) => props.setAction(props.action, 'from', e.target.value) }
        fullWidth
      />
      <TextField
        title="SMS Body"
        value={ props.action.body || '' }
        onChange={ (e) => props.setAction(props.action, 'body', e.target.value) }
        fullWidth
      />

      <Link target="blank" href="https://enfonica.com">
        Powered by enfonica
      </Link> 
    </>
  );
};

// export default
export default ActionSMS;
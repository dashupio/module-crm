
// import react
import React from 'react';
import { View, TextField } from '@dashup/ui';

// create page model config
const PagePhoneForwarding = (props = {}) => {
  
  // return jsx
  return (
    <>
      <View
        view="input"
        type="field"
        struct="phone"
        dashup={ props.dashup }
        getFieldStruct={ props.getFieldStruct }
        field={ {
          help  : 'When someone calls and nobody is available, where should we forward the call?',
          label : 'Incoming Call Number'
        } }

        onChange={ (f, value) => props.setData('forward', value) }
      />
      
      <TextField
        label="Voicemail Message"
        value={ props.page.get('data.message') }
        onChange={ (e) => props.setData('message', e.target.value) }
        fullWidth
        helperText="If no incoming call number is selected, what message do we say?"
      />
    </>
  )
};

// export default
export default PagePhoneForwarding;

// import react
import React from 'react';
import { Form } from '@dashup/ui';

// create page model config
const PagePhoneForwarding = (props = {}) => {
  
  // return jsx
  return (
    <>
      <Form.Field field={ {
        type  : 'phone',
        help  : 'When someone calls and nobody is available, where should we forward the call?',
        label : 'Incoming Call Number',
      } } dashup={ props.dashup } getFieldStruct={ props.getFieldStruct } onChange={ console.log } />
          
      <div className="mb-3">
        <label className="form-label">
          Voicemail Message
        </label>
        <input onChange={ (e) => onMessage(e) } className="form-control" placeholder="Voicemail Message" value={ props.page.get('data.message') } />
        <small>
          If no incoming call number is selected, what message do we say?
        </small>
      </div>
    </>
  )
};

// export default
export default PagePhoneForwarding;
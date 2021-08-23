
// import react
import React from 'react';

// create event action
const ActionSMS = (props = {}) => {

  // return jsx
  return (
    <>
      <div className="mb-3">
        <label className="form-label">
          SMS Recipient(s)
        </label>
        <input className="form-control" value={ props.action.to || '' } type="text" onChange={ (e) => props.setAction(props.action, 'to', e.target.value) } />
        <small>Seperate with <code>,</code></small>
      </div>
      <div className="mb-3">
        <label className="form-label">
          SMS From Name
        </label>
        <input className="form-control" value={ props.action.from || '' } type="text" onChange={ (e) => props.setAction(props.action, 'from', e.target.value) } />
      </div>
      <div className="mb-3">
        <label className="form-label">
          SMS Body
        </label>
        <input className="form-control" value={ props.action.body || '' } type="text" onChange={ (e) => props.setAction(props.action, 'body', e.target.value) } />
      </div>

      <a target="_blank" href="https://enfonica.com" className="text-muted ml-auto">
        Powered by enfonica
      </a> 
    </>
  );
};

// export default
export default ActionSMS;
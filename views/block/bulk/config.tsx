
// import react
import React from 'react';

// block list
const BlockBlockConfig = (props = {}) => {

  // on sms
  const onSMS = (e) => {
    // on background
    props.setBlock(props.block, 'noSMS', e.target.checked);
  };

  // on sms
  const onEmail = (e) => {
    // on background
    props.setBlock(props.block, 'noEmail', e.target.checked);
  };

  // on background
  const onBackground = (e) => {
    // on background
    props.setBlock(props.block, 'background', e.target.checked);
  };

  // return jsx
  return (
    <>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-email" type="checkbox" onChange={ onEmail } checked={ props.block.noEmail } />
          <label className="form-check-label" htmlFor="is-email">
            Disable Email
          </label>
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-sms" type="checkbox" onChange={ onSMS } checked={ props.block.noSMS } />
          <label className="form-check-label" htmlFor="is-sms">
            Disable SMS
          </label>
        </div>
      </div>
      <div className="mb-3">
        <div className="form-check form-switch">
          <input className="form-check-input" id="is-background" type="checkbox" onChange={ onBackground } checked={ props.block.background } />
          <label className="form-check-label" htmlFor="is-background">
            Enable Background
          </label>
        </div>
      </div>
    </>
  );
}

// export default
export default BlockBlockConfig;
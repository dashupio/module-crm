
// import react
import React from 'react';

// block list
const BlockContactConfig = (props = {}) => {

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
export default BlockContactConfig;
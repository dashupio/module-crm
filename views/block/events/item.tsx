
// import react
import moment from 'moment';
import dotProp from 'dot-prop';
import React, { useState, useEffect } from 'react';

// block events
const BlockEventsItem = (props = {}) => {
  // use state
  const [playing, setPlaying] = useState(false);

  // types
  const types = {
    'call:inbound' : {
      icon  : 'fa fa-phone',
      color : 'info',
    },
    'call:outbound' : {
      icon  : 'fa fa-phone-plus',
      color : 'success',
    },
    'sms:inbound' : {
      icon  : 'fa fa-comment',
      color : 'info',
    },
    'sms:outbound' : {
      icon  : 'fa fa-comment',
      color : 'success',
    },
    'note' : {
      icon  : 'fa fa-sticky-note',
      color : 'secondary',
    },
    'email:outbound' : {
      icon  : 'fa fa-envelope',
      color : 'info',
    },
    'email:inbound' : {
      icon  : 'fa fa-envelope-open',
      color : 'info',
    }
  };

  // get value
  const getValue = (name) => {
    // get model
    const forms  = props.getForms([props.model]);
    const fields = props.getFields(forms);

    // field
    const field = props.getField(props.page.get(`data.event.${name}`), fields);

    // return
    if (!field) return;

    // get value
    return props.item.get(field.name || field.uuid);
  };

  // get tags
  const getTags = (tagField) => {
    // tag field
    if (!tagField) return [];

    // get options
    const options = tagField.options || [];

    // check options
    if (!options.length) return [];

    // get value
    let val = props.item.get(tagField.name || tagField.uuid) || [];

    // set value
    if (typeof val === 'string') val = [val];

    // tags
    return options.filter((t) => {
      // return has tag
      return val.includes(t.value);
    });
  };

  // get types
  const getTagTypes = () => {
    // get model
    const forms  = props.getForms([props.model]);
    const fields = props.getFields(forms);

    // set types
    let types = (props.page.get('data.event.status') || []);
    if (!Array.isArray(types)) types = [types];

    // return fields
    return types.map((type) => {
      // return type
      return (fields || []).find((f) => f.uuid === type);
    });
  };

  // get color
  const getColor = () => {
    // get color
    return getTags(getTagTypes()[0])[0]?.color;
  };

  // has tags
  const hasTags = () => {
    // tag uuid
    return (props.page.get('data.event.status') || []).length;
  };

  // return jsx
  return !!props.item && !!types[getValue('type')] ? (
    <div className={ `card card-sm card-task card-${getColor()}` }>
      { !!getColor() && (
        <div className="color-strip" />
      ) }

      <div className="card-body d-flex align-items-center">
        <button className={ `btn btn-lg me-3 btn-${types[getValue('type')].color}` }>
          <i className={ `${types[getValue('type')].icon}` } />
        </button>

        { !!dotProp.get(getValue('user'), '0.avatar.0.thumbs.sm-sq.url') && (
          <img className="img-avatar rounded-circle mr-3" src={ dotProp.get(getValue('user'), '0.avatar.0.thumbs.sm-sq.url') } />
        ) }

        <div>
          <b className="d-block">
            { dotProp.get(getValue('user'), '0.name') } { getValue('title') }
          </b>
          { !!(getValue('type') === 'email:outbound' || getValue('type') === 'email:inbound') ? (
            <div>
              TODO
              EDITOR
            </div>
          ) : (
            <p className="m-0">
              { getValue('body') }
            </p>
          ) }
          <small>
            { moment(props.item.get('_meta.created_at')).format('Do MMM, h:mma') }
          </small>
          { !!dotProp.get(getValue('date'), 'duration') && (
            <small className="ms-2">
              <b>
                { new Date(dotProp.get(getValue('date'), 'duration')).toISOString().substr(11, 8) }
              </b>
            </small>
          ) }
          { hasTags() && (
            <div className="tags mt-2">
              { getTagTypes().map((type, a) => {
                // return
                return (
                  <React.Fragment key={ `tag-${type}` }>
                    { getTags(type).map((tag, i) => {
                      // return jsx
                      return (
                        <button key={ `tag-${type}-${tag.value}` } className={ `btn btn-sm mr-1 btn-${tag.color}` }>
                          { tag.label }
                        </button>
                      );
                    }) }
                  </React.Fragment>
                );
              }) }
            </div>
          ) }
        </div>
        
        { !!(getValue('recording') && getValue('recording').length) && (
          <div className="ms-auto d-flex flex-row">
            <div className="align-items-center me-3">
              <div className="btn-group">
                <button className="btn btn-primary" onclick={ (e) => onTogglePlay(e) }>
                  <i className={ `fa fa-${playing ? 'pause' : 'play'}` } />
                </button>
                <a className="btn btn-primary" download={ `${props.item.get('_id')}` } target="_BLANK" href={ dotProp.get(getValue('recording'), '0.url') }>
                  <i className="fa fa-download" />
                </a>
              </div>
            </div>
            TODO
            WAVESURFER
          </div>
        ) }
      </div>
    </div>
  ) : <div />;
};

export default BlockEventsItem;
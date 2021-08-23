
// import react
import dotProp from 'dot-prop';
import { Chat } from '@dashup/ui';
import React from 'react';

// block events
const BlockEvent = (props = {}) => {
  // get value
  const getValue = (item = props.event, name) => {
    // get model
    const forms  = props.getForms([props.model]);
    const fields = props.getFields(forms);

    // field
    const field = props.getField(props.page.get(`data.event.${name}`), fields);

    // return
    if (!field) return;

    // get value
    return item.get(field.name || field.uuid);
  };

  // get message
  const getMessage = (item = props.event) => {
    // message
    let embeds = [];
    let message = '';

    // get type
    const type = getValue(item, 'type');

    // check type
    if (type === 'chat') {
      message = getValue(item, 'body');
    } else if (type === 'note') {
      embeds = [{
        type : 'note',
        data : {
          body : getValue(item, 'body'),
        },
      }];
    } else if (type.includes('sms:')) {
      embeds = [{
        type : 'sms',
        data : {
          body  : getValue(item, 'body'),
          title : getValue(item, 'title'),
        },
        color : 'warning',
      }];
    } else if (type.includes('email:')) {
      embeds = [{
        type : 'email',
        data : {
          body  : getValue(item, 'body'),
          title : getValue(item, 'title'),
        },
        color : 'info',
      }];
    } else if (type.includes('phone:')) {
      embeds = [{
        type : 'phone',
        data : {
          body  : getValue(item, 'body'),
          title : getValue(item, 'title'),
        },
        color : 'primary',
      }];
    }

    // return message
    return {
      by : {
        id     : dotProp.get(getValue(item, 'user'), '0.id'),
        name   : dotProp.get(getValue(item, 'user'), '0.name'),
        avatar : dotProp.get(getValue(item, 'user'), '0.avatar.0.thumbs.sm-sq.url'),
      },
      embeds,
      message,

      created_at : item.get('_meta.created'),
      updated_at : item.get('_meta.updated'),
    };
  };

  // return jsx
  return !!props.item ? (
    <Chat.Message
      { ...props }

      next={ props.next && getMessage(props.next) }
      prev={ props.prev && getMessage(props.prev) }
      message={ getMessage() }

      noChat
    />
  ) : <div />;
};

export default BlockEvent;
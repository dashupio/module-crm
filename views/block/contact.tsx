
// import react
import dotProp from 'dot-prop';
import { Tab, Tabs } from 'react-bootstrap';
import React, { useRef, useState } from 'react';

// block events
const BlockContact = (props = {}) => {
  // use state
  const [tab, setTab] = useState('note');
  const [loading, setLoading] = useState(false);

  // use ref
  const sms     = useRef(null);
  const note    = useRef(null);
  const email   = useRef(null);
  const subject = useRef(null);

  // get value
  const getValue = (name, tld = null) => {
    // get model page
    const model = props.block.model || props.model;

    // check model page
    if (!model) return null;

    // get item
    const { item } = props;

    // return field
    const forms = props.getForms(model);
    const fields = props.getFields(forms);

    // get actual field
    const field = props.getField(props.page.get(`data.field.${name}`), fields);

    // return value
    return dotProp.get(item.toJSON(), `${field.name || field.uuid}${tld ? `.${tld}` : ''}`);
  };

  // get email
  const getEmail = () => {
    // return email
    return (props.page.get('connects') || []).find((c) => c.email);
  };
      
  // on email
  const onEmail = async (e) => {
    // prevent default
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // get item
    const { item } = props;

    // check email
    if (!item || !getValue('email')) return;

    // check sms
    const body    = email.current?.innerText;
    const title   = subject.current?.value;
    const connect = getEmail();

    // loading
    setLoading('email');
    
    // submit form
    await props.dashup.action({
      type   : 'connect',
      user   : props.me.get('_id'),
      page   : props.page.get('_id'),
      form   : props.page.get('data.event.form'),
      model  : props.page.get('data.event.model'),
      struct : connect.type,
    }, 'send', connect, {
      body,
      to      : getValue('email'),
      item    : item.get('_id'),
      user    : props.dashup.get('_meta.member'),
      subject : title, 
    });

    // loading
    setLoading(false);
  };

  // on sms
  const onSMS = async (e) => {
    // prevent default
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // check sms
    const body = sms.current?.value;

    // reset value
    if (sms.current) sms.current.value = '';

    // loading
    setLoading('sms');

    // create call
    await props.phone.sms(props, props.item, body);

    // loading
    setLoading(null);
  };
  
  // on note
  const onNote = async (e) => {
    // prevent default
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // check sms
    const body = note.current?.value;

    // reset value
    if (note.current) note.current.value = '';

    // loading
    setLoading('note');

    // add event
    await props.phone.event(props, {
      body,
      item  : props.item,
      type  : 'note',
      time  : new Date(),
      title : 'Added Note',
    });

    // loading
    setLoading(null);
  };

  // return jsx
  return (
    <div className={ `flex-1 d-flex flex-column h-100 w-100${props.block.background ? ' card' : ''}` }>
      { !!props.block.label && (
        <div className={ props.block.background ? 'card-header' : ' mb-2' }>
          <b>{ props.block.label }</b>
        </div>
      ) }
      <div className={ props.block.background ? 'card-body' : 'd-flex flex-column' }>
        <Tabs
          id="contact-tabs"
          onSelect={ setTab }
          activeKey={ tab }
          className="mb-3"
          >
          <Tab eventKey="note" title="Note">
            <label className="form-label">
              Note
            </label>
            <textarea ref={ note } className="form-control" type="text" />
          </Tab>
          <Tab eventKey="sms" title="SMS">
            <label className="form-label">
              SMS Message
            </label>
            <input ref={ sms } className="form-control" type="text" />
          </Tab>
          <Tab eventKey="email" title="Email" disabled={ !getEmail() }>
            <label className="form-label">
              Email
            </label>
            <input ref={ subject } className="form-control mb-3" placeholder="Subject" />
            EDITOR
          </Tab>
        </Tabs>
      </div>
      { !!props.item && (
        <div className={ `${props.block.background ? 'card-footer' : 'mt-2'}` }>
          { tab === 'email' && (
            <button className={ `btn btn-success${loading ? ' disabled' : ''}${getValue('email') ? '' : ' disabled'}` } onClick={ (e) => onEmail(e) }>
              { loading ? 'Sending...' : 'Send' }
            </button>
          ) }
          { tab === 'sms' && (
            <button className={ `btn btn-success${loading ? ' disabled' : ''}` } onClick={ (e) => onSMS(e) }>
              { loading ? 'Sending...' : 'Send' }
            </button>
          ) }
          { tab === 'note' && (
            <button className={ `btn btn-success${loading ? ' disabled' : ''}` } onClick={ (e) => onNote(e) }>
              { loading ? 'Submitting...' : 'Submit' }
            </button>
          ) }
        </div>
      ) }
    </div>
  );
}

// export default
export default BlockContact;
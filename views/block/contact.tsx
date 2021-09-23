
// import react
import dotProp from 'dot-prop';
import SimpleBar from 'simplebar-react';
import React, { useRef, useState, useEffect } from 'react';
import { Chat, OverlayTrigger, Tooltip, Button } from '@dashup/ui';

// import item
import Item from './event';

// import contact
import './contact.scss';

// block events
const BlockContact = (props = {}) => {
  // use state
  const [tab, setTab] = useState('chat');
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState([]);
  const [limit, setLimit] = useState(25);
  const [subject, setSubject] = useState('');
  const [updated, setUpdated] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // get model
  const getModel = () => {
    return props.block.model || (props.page ? props.page.get('data.event.model') : null);
  };

  // get props
  const getProps = () => {
    // new props
    const newProps = { ...props };

    // delete unwanted
    delete newProps.view;
    delete newProps.type;
    delete newProps.model;
    delete newProps.struct;

    // return new props
    return newProps;
  };

  // get value
  const getValue = (name, tld = null) => {
    // get model page
    const model = props.block.model || props.model;

    // check model page
    if (!model) return null;

    // get item
    const { item } = props;

    // return field
    const forms = props.getForms([model]);
    const fields = props.getFields(forms);

    // get actual field
    const field = props.getField(props.page.get(`data.field.${name}`), fields);

    // return value
    return dotProp.get(item.toJSON(), `${field.name || field.uuid}${tld ? `.${tld}` : ''}`);
  };

  // load data
  const loadData = async () => {
    // get query
    const getQuery = () => {
      // check item
      if (!props.item || !props.item.get('_id')) return;

      // get model page
      const model = getModel();

      // check model page
      if (!model) return;

      // get model page
      const modelPage = props.dashup.page(model);

      // check model page
      if (!modelPage) return;

      // get field
      const eventId = props.block.field || props.page.get('data.event.item');

      // check model page
      if (!eventId) return;

      // get forms
      const formPages = props.getForms([modelPage]);
      
      // get fields
      const fields = props.getFields(formPages);

      // check fields
      if (!fields.length) return;

      // event field
      const eventField = fields.find((f) => f.uuid === eventId);

      // check fields
      if (!eventField) return;

      // get query
      return modelPage.where({
        [eventField.name || eventField.uuid] : props.item.get('_id'),
      });
    }

    // return nothing
    if (!getQuery()) return {};
    
    // list
    return {
      data  : await getQuery().skip(skip).limit(limit).listen(),
      total : await getQuery().count(),
    };
  };

  // get email
  const getEmail = () => {
    // return email
    return (props.page.get('connects') || []).find((c) => c.email);
  };

  // on send
  const onSend = async (e, { message }) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // check type
    if (tab === 'sms') {
      // send sms out
      return await props.sendSMS(message);
    } else if (tab === 'email') {
      // send email out
      const rtn = await props.sendEmail(getEmail(), subject, message);

      // set subject
      setSubject('');

      // return
      return rtn;
    }
    
    // create message
    await props.addEvent({
      body : message,
      item : props.item,
      type : tab,
      time : new Date(),
    });
  };

  // on update
  const onUpdate = () => {
    // set updated
    setUpdated(new Date());
  };

  // use effect
  useEffect(() => {
    // check loading
    if (loading) return;

    // set loading
    setLoading(true);

    // listening
    let listening = null;

    // load data
    loadData().then(({ data = [], total = 0 }) => {
      // on update
      if (data?.on) data.on('update', onUpdate);

      // set listening
      listening = data;

      // set data
      setItems(data);
      setLoading(false);
    });

    // return nothing
    return () => {
      // items
      if (!listening.removeListener) return;

      // remove listener
      listening.deafen();
      listening.removeListener('update', onUpdate);
    };
  }, [getModel(), props.item && props.item.get('_id'), skip, limit]);

  // return jsx
  return (
    <div className={ `flex-1 d-flex flex-column h-100 w-100${props.block.background ? ' card' : ''}` }>
      { !!props.item && getValue('name') && (
        <div className={ props.block.background ? 'card-header' : ' mb-2' }>
          <b>{ getValue('name') }</b>
        </div>
      ) }
      
      <div className="flex-1 fit-content">
        <div className="h-100">
          <SimpleBar className={ `p-relative h-100${props.block.background ? ' card-body' : ''}` }>
            { loading ? (
              <div className="text-center">
                <i className="fa fa-spinner fa-spin" />
              </div>
            ) : (items || []).map((item, i) => {
              // return jsx
              return (
                <Item
                  { ...getProps() }
                  key={ `event-${item.get('_id')}` }
                  prev={ items[i - 1] }
                  next={ items[i + 1] }
                  event={ item }
                  model={ getModel() }
                />
              );
            }) }
          </SimpleBar>
        </div>
      </div>
      
      { !!props.item && (
        <div className={ `flex-0 ${props.block.background ? 'card-body' : 'd-flex flex-column'}` }>
          <div className="mb-3">
            <OverlayTrigger
              overlay={
                <Tooltip>
                  Send Chat
                </Tooltip>
              }
              placement="top"
            >
              <Button className="me-2" onClick={ (e) => setTab('chat') } variant={ tab === 'chat' ? 'primary' : 'secondary' }>
                Chat
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              overlay={
                <Tooltip>
                  Add Note
                </Tooltip>
              }
              placement="top"
            >
              <Button className="me-2" onClick={ (e) => setTab('note') } variant={ tab === 'note' ? 'primary' : 'secondary' }>
                Note
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              overlay={
                <Tooltip>
                  Send SMS
                </Tooltip>
              }
              placement="top"
            >
              <Button className="me-2" onClick={ (e) => setTab('sms') } variant={ tab === 'sms' ? 'primary' : 'secondary' }>
                SMS
              </Button>
            </OverlayTrigger>
            <OverlayTrigger
              overlay={
                <Tooltip>
                  { getEmail() ? 'Send Email' : 'Please configure an email connect' }
                </Tooltip>
              }
              placement="top"
            >
              <Button className="me-2" disabled={ !getEmail() } onClick={ (e) => setTab('email') } variant={ tab === 'email' ? 'primary' : 'secondary' }>
                Email
              </Button>
            </OverlayTrigger>
          </div>
          { tab === 'email' && (
            <div className="mb-2">
              <input className="form-control" placeholder="Subject" value={ subject } onChange={ (e) => setSubject(e.target.value) } />
            </div>
          ) }
          <Chat.Input
            noChat
            size="lg"
            onSend={ onSend }
            { ...props }
          />
        </div>
      ) }
    </div>
  );
}

// export default
export default BlockContact;
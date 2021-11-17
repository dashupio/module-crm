
// import react
import dotProp from 'dot-prop';
import SimpleBar from 'simplebar-react';
import React, { useState, useEffect } from 'react';
import { Tab, Box, Chat, TabContext, TabList, Card, CardHeader, CardContent, CircularProgress, TextField } from '@dashup/ui';

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

  // tabs
  const tabs = ['Chat', 'Note', 'SMS', 'Email'];

  // card
  return (
    <Card sx={ {
      width         : '100%',
      height        : '100%',
      display       : 'flex',
      flexDirection : 'column',
    } }>
      { !!props.item && (
        <CardHeader
          title={ getValue('name') }
        />
      ) }
      <CardContent sx={ {
        flex : 1,
      } }>
        <SimpleBar style={ {
          height : '100%',
        } }>
          { loading ? (
            <Box flex={ 1 } alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (items || []).map((item, i) => {
            // return jsx
            return (
              <Item
                key={ `event-${item.get('_id')}` }
                prev={ items[i - 1] }
                next={ items[i + 1] }
                event={ item }
                model={ getModel() }
                { ...getProps() }
              />
            );
          }) }
        </SimpleBar>
      </CardContent>
      { !!props.item && (
        <CardContent sx={ {
          flex : 0,
        } }>
          <TabContext value={ tab }>
            <Box sx={ { borderBottom : 1, borderColor : 'divider', mb : 2 } }>
              <TabList onChange={ (e, v) => setTab(v.toLowerCase()) }>
                { tabs.map((t, i) => {
                  // return jsx
                  return <Tab key={ `tab-${t}` } value={ t.toLowerCase() } label={ t } />;
                }) }
              </TabList>
            </Box>
          </TabContext>
          { tab === 'email' && (
            <TextField
              label="Subject"
              value={ subject }
              onChange={ (e) => setSubject(e.target.value) }
            />
          ) }
          <Chat.Input
            noChat
            size="lg"
            onSend={ onSend }
            { ...props }
          />
        </CardContent>
      ) }
      <Box />
    </Card>
  );
}

// export default
export default BlockContact;
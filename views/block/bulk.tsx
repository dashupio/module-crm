
// react
import React, { useState, useEffect } from 'react';
import { Box, Card, CardActions, LoadingButton, TabContext, TabList, TextField, MenuItem, CardHeader, CardContent, Button, Tab, Modal, View, Select } from '@dashup/ui';

// create block bulk
const BlockBulk = (props = {}) => {
  // use setate
  const [tab, setTab] = useState(props.block.noEmail ? 'sms' : 'email');
  const [from, setFrom] = useState('');
  const [body, setBody] = useState('');
  const [code, setCode] = useState(false);
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState(null);
  const [modal, setModal] = useState(false);
  const [number, setNumber] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [success, setSuccess] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * load numbers
   */
  const loadNumbers = async (c) => {
    // loading
    setLoading('numbers');

    // load from page
    const loadedNumbers = await props.page.action('list');

    // update
    setNumbers(loadedNumbers);
    setNumber(loadedNumbers.length ? loadedNumbers[0]._id : null);
    setLoading(false);
  };

  /**
   * get number
   */
  const getNumber = () => {
    // return emails
    return [...numbers].map((number) => {
      return {
        label : number?.number?.number,
        value : number._id,

        selected : number === number._id,
      }
    });
  };

  /**
   * get email data
   */
  const getEmail = () => {
    // return emails
    return [...(props.page.get('connects') || [])].filter((e) => e.email).map((connect) => {
      return {
        label : connect.email,
        value : connect.uuid,

        selected : email === connect.uuid,
      }
    });
  };

  // on send
  const onSend = async (e) => {
    // set loading
    setLoading(new Date());

    // done count
    let doneCount = 0;

    // check tab
    if (tab === 'email') {
      doneCount = await onEmail();
    } else if (tab === 'sms') {
      doneCount = await onSMS();
    }

    // loading
    setSuccess(doneCount);
    setLoading(false);

    // timeout
    setTimeout(() => {
      setBody('');
      setFrom('');
      setModal(false);
      setMessage('');
      setSubject('');
      setSuccess(null);
    }, 2000);
  };

  // email
  const onSMS = async () => {
    // get connect
    const count = await props.page.action('bulk', {
      from,
      number,
      message,
      query    : props.getQuery().query,
      selected : props.selected,
    });

    // return count
    return count;
  };

  // email
  const onEmail = async () => {
    // data
    const data = {
    };

    console.log(data, props.getQuery().query, selected); return;

    // get connect
    const connect = props.page.get('connects').find((c) => c.uuid === email);
        
    // submit form
    const { count } = await props.dashup.action({
      type   : 'action',
      page   : props.page.get('_id'),
      struct : 'email',
    }, 'bulk', connect, {
      body,
      subject,
      from     : email,
      user     : props.dashup.get('_meta.member'),
      query    : props.getQuery().query,
      selected : props.selected,
    });

    // return count
    return count;
  };

  // use effect
  useEffect(() => {
    loadNumbers();
  }, []);

  // tabs
  const tabs = ['Email', 'SMS'];

  // card
  return (
    <>
      <Card sx={ {
        width         : '100%',
        height        : '100%',
        display       : 'flex',
        flexDirection : 'column',
      } }>
        { !!props.block.name && (
          <CardHeader
            title={ props.block.name }
          />
        ) }
        <CardContent sx={ {
          flex : 1,
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
          { !!getEmail().length && tab === 'email'  && (
            <TextField
              select
              label="Email From"
              value={ email }
              onChange={ (e) => setEmail(e.target.value) }
              fullWidth
            >
              { getEmail().map((item) => {
                return (
                  <MenuItem key={ item.value } value={ item.value }>
                    { item.label }
                  </MenuItem>
                );
              }) }
            </TextField>
          ) }
          { tab === 'email' && (
            <TextField
              label="Subject"
              value={ subject }
              onChange={ (e) => setSubject(e.target.value) }
              fullWidth
            />
          ) }
          { !!getNumber().length && tab === 'sms' && (
            <TextField
              select
              label="SMS Number"
              value={ number }
              onChange={ (e) => setNumber(e.target.value) }
              fullWidth
            >
              { getNumber().map((item) => {
                return (
                  <MenuItem key={ item.value } value={ item.value }>
                    { item.label }
                  </MenuItem>
                );
              }) }
            </TextField>
          ) }
          { tab === 'email' && (
            <View
              type="field"
              view="input"
              struct="wysiwyg"

              field={ {
                label : 'Body',
              } }
              value={ body }
              dashup={ props.dashup }
              onChange={ (f, value) => setBody(value) }
            />
          ) }
          { tab === 'sms' && (
            <TextField
              label="SMS Body"
              value={ message }
              onChange={ (e) => setMessage(e.target.value) }
              fullWidth
            />
          ) }
        </CardContent>
        <CardActions sx={ {
          justifyContent : 'end',
        } }>
          <LoadingButton color="success" variant="contained" disabled={ !!(loading || !props.selected?.total || (!body.length && !message.length)) } loading={ !!loading } onClick={ (e) => setModal(true) }>
            { loading ? 'Sending...' : 'Send' } { props.selected?.total ? props.selected.total.toLocaleString() : '' }
          </LoadingButton>
        </CardActions>
      </Card>
    </>
  );

  // return jsx
  return (
    <>
      <div className={ `flex-1 d-flex flex-column h-100 w-100${props.block.background ? ' card' : ''}` }>
        { !!props.block.name && (
          <div className={ props.block.background ? 'card-header' : 'mb-2' }>
            <b>{ props.block.name }</b>
          </div>
        ) }
        <div className={ props.block.background ? 'card-body' : 'd-flex flex-column' }>
          <Tabs
            id="contact-tabs"
            onSelect={ setTab }
            activeKey={ tab }
            className="mb-3"
            >
            { !props.block.noEmail && (
              <Tab eventKey="email" title="Email" disabled={ !getEmail() }>
                
              </Tab>
            ) }
            
            { !props.block.noSMS && (
              <Tab eventKey="sms" title="SMS">
                { !!getNumber().length && (
                  <div className="mb-3">
                    <label className="form-label">
                      SMS Number
                    </label>
                    <Select options={ getNumber() } value={ getNumber().filter((e) => e.selected) } onChange={ (v) => setNumber(v?.value) } />
                  </div>
                ) }
                <div className="mb-3">
                  <label className="form-label">
                    From Name
                  </label>
                  <input className="form-control" type="text" value={ from } onChange={ (e) => setFrom(e.target.value) } />
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    SMS Message
                  </label>
                  <input className="form-control" type="text" value={ message } onChange={ (e) => setMessage(e.target.value) } />
                </div>
              </Tab>
            ) }
          </Tabs>
        </div>
        <div className={ `d-flex ${props.block.background ? 'card-footer' : 'mt-2'}` }>
          <Button variant="success" disabled={ loading || !props.selected?.total || (!body.length && !message.length) } className="ms-auto" onClick={ (e) => setModal(true) }>
            { loading ? 'Sending...' : 'Send' } { props.selected?.total ? props.selected.total.toLocaleString() : '' }
          </Button>
        </div>
      </div>

      { !!modal && (
        <Modal show onHide={ () => setModal(false) }>
          <Modal.Header closeButton>
            <Modal.Title>
              Sending <b>{ (props.selected?.total || 0).toLocaleString() } </b> { tab === 'email' ? 'emails' : 'texts' }
            </Modal.Title>
          </Modal.Header>
          { success ? (
            <Modal.Body>
              Successfully queued <b>{ (props.selected?.total || 0).toLocaleString() } </b> { tab === 'email' ? 'emails' : 'texts' }. Good work!
            </Modal.Body>
          ) : (
            <Modal.Body>
              This will send <b>{ (props.selected?.total || 0).toLocaleString() } </b> { tab === 'email' ? 'emails' : 'texts' }. Please ensure you're certain before clicking submit.
            </Modal.Body>
          ) }
          <Modal.Footer>
            <Button variant="secondary" onClick={ () => setModal(false) }>
              Close
            </Button>
            <Button variant="success" className="ms-auto" disabled={ loading || success } onClick={ (e) => onSend() }>
              { loading ? 'Submitting...' : 'Submit' }
            </Button>
          </Modal.Footer>
        </Modal>
      ) }
    </>
  );
};

// export default
export default BlockBulk;
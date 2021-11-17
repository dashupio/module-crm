
// import react
import React, { useRef, useState, useEffect } from 'react';
import { Box, Menu, Stack, MenuItem, Button, Icon, IconButton, ButtonGroup, Tooltip } from '@dashup/ui';

// application page
const PhonePageMenu = (props = { numbers : [] }) => {
  // numbers
  const [open, setOpen] = useState(false);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [connection, setConnection] = useState(null);

  // break out props
  const { phone } = props;

  // refs
  const menuRef = useRef(null);

  // variables
  const status = {
    'busy'       : 'warning',
    'open'       : 'success',
    'ready'      : 'success',
    'closed'     : 'light',
    'offline'    : 'error',
    'pending'    : 'info',
    'ringing'    : 'primary',
    'connecting' : 'info',
  };
  const buttons = [
    {
      btn : 1,
      sub : '',
    },
    {
      btn : 2,
      sub : 'ABC',
    },
    {
      btn : 3,
      sub : 'DEF',
    },
    {
      btn : 4,
      sub : 'GHI',
    },
    {
      btn : 5,
      sub : 'JKL',
    },
    {
      btn : 6,
      sub : 'MNO',
    },
    {
      btn : 7,
      sub : 'PQRS',
    },
    {
      btn : 8,
      sub : 'TUV',
    },
    {
      btn : 9,
      sub : 'WXYZ',
    },
    {
      btn : '*',
    },
    {
      btn : 0,
      sub : '+',
    },
    {
      btn : '#',
    }
  ];

  // ucFirst
  const ucFirst = (str) => {
    // return
    return `${str}`.charAt(0).toUpperCase() + `${str}`.slice(1);
  };

  // on accept
  const onAccept = (e) => {
    // update
    connection.call.answered = new Date();
    connection.conn.accept();
  };

  // on reject
  const onReject = (e) => {
    // update
    connection.conn.reject();
    connection.conn.disconnect();
  };

  // on end
  const onEnd = (e) => {
    // accept call
    connection.conn.disconnect();
  };

  // on mute
  const onMute = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // accept call
    connection.call.muted ? connection.conn.unmute() : connection.conn.mute();
  };

  // on number
  const onNumber = (e, number) => {
    // set in props
    phone.number(props, number.number);
  };

  // on dialler
  const onDialler = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // set in props
    phone.dialler(props, uuid());
  };

  // on press
  const onPress = (e, btn) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // set in props
    phone.press(props, `${btn}`);
  }

  // on call
  const onCall = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // create call
    phone.start(props, connection.item);
  };

  // on next
  const onNext = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // pause dialler
    phone.next(props);
  };

  // on play
  const onPlay = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // pause dialler
    phone.play(props);
  };

  // on pause
  const onPause = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // pause dialler
    phone.pause(props);
  };

  // on finish
  const onFinish = (e) => {
    // prevent default
    e.preventDefault();
    e.stopPropagation();

    // pause dialler
    phone.finish(props);
  };
  
  // load numbers
  const loadNumbers = async () => {
    // load numbers
    const availableNumbers = await props.page.action('list') || [];

    // set numbers
    setNumbers(availableNumbers);

    // numbers
    if (availableNumbers.length === 1) {
      // default
      phone.number(props, (availableNumbers[0].number || {}).number);
    }
  };

  // use effect
  useEffect(() => {
    // set loading
    setLoading(false);

    // on connection
    const onConnection = () => {
      // set updated
      setUpdated(new Date());
    };

    // build
    phone.init({ props }).then((conn) => {
      // set actual connection
      setConnection(conn);

      // load numbers
      loadNumbers();
    });

    // on update
    phone.on('update', onConnection);

    // unlisten
    return () => {
      phone.removeListener('update', onConnection);
    };
  }, [props.page.get('_id')]);

  // use effect
  useEffect(() => {
    // set item
    phone.item(props, props.item && props.item.get('_id') ? props.item : null, true);
  }, [props.item && props.item.get()]);

  // return jsx
  return props.updating ? <Box /> : (
    <>
      <Stack direction="row" spacing={ 1 } alignItems="center">
        { !!(connection?.number && !connection?.call) && (
          <Button onClick={ (e) => numbers && numbers.length > 1 && setOpen(true) } ref={ menuRef }>
            { connection.number }
          </Button>
        ) }

        { /* SELECT NUMBER */ }
        { !!(numbers && numbers.length > 1 && !connection.number && !connection?.call) && (
          <Button variant="contained" onClick={ (e) => setOpen(true) } ref={ menuRef } color="info">
            { 'Select Number' }
          </Button>
        ) }

        { /* CONNECTION STATUS */ }
        { !!connection?.call && (
          <Button>
            { new Date((new Date().getTime() - connection.call.start.getTime())).toISOString().substr(11, 8) }
          </Button>
        ) }
        { !!connection && (
          <Tooltip title={ ucFirst(connection.status || 'connecting') }>
            <IconButton color={ status[connection.status || 'connecting'] } variant="contained">
              <Icon type="fas" icon="plug" />
            </IconButton>
          </Tooltip>
        ) }

        { /* INCOMING CALL */ }
        { !!(connection && connection.call && connection.call.type === 'inbound' && !connection.call.answered) && (
          <>
            <Tooltip title="Accept Call">
              <IconButton onClick={ (e) => onAccept(e) } color="success">
                <Icon type="fas" icon="phone" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Call">
              <IconButton onClick={ (e) => onReject(e) } color="error">
                <Icon type="fas" icon="times" />
              </IconButton>
            </Tooltip>
          </>
        ) }

        { /* CURRENT ACTIVE CALL */ }
        { !!(connection && connection.call && (connection.call.type !== 'inbound' || connection.call.answered)) && (
          <>
            <Tooltip title="Mute Call">
              <IconButton color={ connection.call.muted ? 'error' : 'success' } onClick={ (e) => onMute(e) }>
                <Icon type="fas" icon={ connection.call.muted ? 'volume-mute' : 'volume' } />
              </IconButton>
            </Tooltip>
            <Tooltip title="End Call">
              <IconButton color="danger" onClick={ (e) => onEnd(e) }>
                <Icon type="fas" icon="times" />
              </IconButton>
            </Tooltip>
          </>
        ) }

        { /* START ACTIVE CALL */ }
        { !!(connection && connection.item && !connection.call) && (
          <Tooltip title="Start Call">
            <IconButton className="btn btn-primary" onClick={ (e) => onCall(e) }>
              <Icon type="fas" icon="phone" />
            </IconButton>
          </Tooltip>
        ) }

        { /* DIALLER */ }
        { !!connection && (
          <ButtonGroup>
            { connection.dialler ? (
              <Button variant="contained" color="primary">
                { ucFirst(connection.dialler.status) } - 
                { connection.dialler.dialled?.length || 0 } of { connection.count }
              </Button>
            ) : (
              <Tooltip title="Start Dialler">
                <IconButton onClick={ (e) => onDialler(e) }>
                  <Icon type="fas" icon="play" />
                </IconButton>
              </Tooltip>
            ) }
            { connection.dialler?.status === 'dialling' && (
              <>
                <Tooltip title="Next Call">
                  <IconButton onClick={ (e) => onNext(e) }>
                    <Icon type="fas" icon="forward" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Pause Dialler">
                  <IconButton onClick={ (e) => onPause(e) }>
                    <Icon type="fas" icon="pause" />
                  </IconButton>
                </Tooltip>
              </>
            ) }
            { connection.dialler?.status === 'paused' && (
              <>
                <Tooltip title="Start Dialler">
                  <IconButton onClick={ (e) => onPlay(e) }>
                    <Icon type="fas" icon="play" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="End Dialler">
                  <IconButton onClick={ (e) => onFinish(e) }>
                    <Icon type="fas" icon="times" />
                  </IconButton>
                </Tooltip>
              </>
            ) }
            { connection.dialler?.status === 'finished' && (
              <Tooltip title="End Dialler">
                <IconButton onClick={ (e) => onFinish(e) }>
                  <Icon type="fas" icon="times" />
                </IconButton>
              </Tooltip>
            ) }
          </ButtonGroup>
        ) }

        { props.dashup.can(props.page, 'submit') && !!props.getForms().length && (
          <Button variant="contained" color="primary" onClick={ (e) => props.setItem(new props.dashup.Model({}, props.dashup), true) } startIcon={ (
            <Icon icon={ props.getForms()[0].get('icon') || 'plus' } />
          ) }>
            { props.getForms()[0].get('name') }
          </Button>
        ) }
        
        { !!(connection && connection.call) && (
          <div className="dropdown d-inline-block" data-toggle="tooltip" title="Show Keypad">
            <button className="btn btn-light" data-toggle="dropdown">
              <i className="fat fa-phone-office" />
            </button>
            <div className="dropdown-menu dropdown-menu-right">
              <div className="card card-sm card-tags m-0">
                <div className="card-body">
                  <div className="row g-0">
                    { buttons.map((btn, i) => {
                      // return jsx
                      return (
                        <div key={ `call-${btn.btn}` } className="col-4 d-flex" onClick={ (e) => onPress(e, btn.btn) }>
                          <button className="btn px-0 w-100 btn-lg btn-light">
                            <div className="h1">
                              { btn.btn }
                            </div>
                            <small className="d-block">
                              { btn.sub || ' ' }
                            </small>
                          </button>
                        </div>
                      );
                    }) }
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) }
        
      </Stack>
    
      <Menu
        open={ !!open }
        onClose={ () => setOpen(false) }
        anchorEl={ menuRef?.current }
      >
        { numbers.map((item, i) => {
          // return value
          return (
            <MenuItem key={ `number-${item.number.number}` } onClick={ (e) => !setOpen(false) && onNumber(e, item.number) }>
              { item.number.number }
            </MenuItem>
          );
        }) }
      </Menu>
    </>
  );
};

// export default
export default PhonePageMenu;

// import react
import { Dropdown } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';

// application page
const PhonePageMenu = (props = { numbers : [] }) => {
  // numbers
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(new Date());
  const [connection, setConnection] = useState(null);

  // break out props
  const { phone } = props;

  // variables
  const status = {
    'busy'       : 'warning',
    'open'       : 'success',
    'ready'      : 'success',
    'closed'     : 'light',
    'offline'    : 'danger',
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
  return props.updating ? <div /> : (
    <>
      { !!(connection?.number && !connection?.call) && (
        <button className="btn btn-link me-2">
          { connection.number }
        </button>
      ) }

      { /* SELECT NUMBER */ }
      { !!(numbers && numbers.length > 1 && !connection?.call) && (
        <Dropdown className="d-inline-block me-2">
          <Dropdown.Toggle variant={ connection && connection.number ? 'light' : 'info' }>
            { connection && connection.number || 'Select Number' }
          </Dropdown.Toggle>
          <Dropdown.Menu>
            { numbers.map((item, i) => {
              // return value
              return (
                <Dropdown.Item key={ `number-${item.number.number}` } onClick={ (e) => onNumber(e, item.number) }>
                  { item.number.number }
                </Dropdown.Item>
              );
            }) }
          </Dropdown.Menu>
        </Dropdown>
      ) }

      { /* CONNECTION STATUS */ }
      { !!connection && (
        connection.call ? (
          <>
            <button className="btn btn-link me-2" data-toggle="tooltip" title="Call Time">
              { new Date((new Date().getTime() - connection.call.start.getTime())).toISOString().substr(11, 8) }
            </button>
            <div className="btn-group me-1" data-toggle="tooltip" title="Call Status">
              <button className={ `btn btn-${status[connection.call.status || 'connecting']}` }>
                { ucFirst(connection.call.status) }
              </button>
            </div>
          </>
        ) : (
          <button className={ `btn me-2 btn-${status[connection.status || 'connecting']}` } data-toggle="tooltip" title="Connection Status">
            <i className="fat fa-plug me-2" />
            { ucFirst(connection.status || 'connecting') }
          </button>
        )
      ) }

      { /* INCOMING CALL */ }
      { !!(connection && connection.call && connection.call.type === 'inbound' && !connection.call.answered) && (
        <div className="btn-group me-1">
          <button className="btn btn-success" onClick={ (e) => onAccept(e) } data-toggle="tooltip" title="Accept Incoming Call">
            <i className={ `fa fa-phone me-2` } />
            Accept
          </button>
          <button className="btn btn-danger me-2" onClick={ (e) => onReject(e) } data-toggle="tooltip" title="Reject Incoming Call">
            <i className={ `fa fa-times me-2` } />
            Reject
          </button>
        </div>
      ) }

      { /* CURRENT ACTIVE CALL */ }
      { !!(connection && connection.call && (connection.call.type !== 'inbound' || connection.call.answered)) && (
        <div className="btn-group me-1">
          <button className={ `btn btn-${connection.call.muted ? 'danger' : 'success'}` } onClick={ (e) => onMute(e) } data-toggle="tooltip" title="Mute Call">
            <i className={ `fat fa-${connection.call.muted ? 'volume-mute' : 'volume'}` } />
          </button>
          <button className="btn btn-danger" onClick={ (e) => onEnd(e) } data-toggle="tooltip" title="End Call">
            <i className={ `fat fa-times` } />
          </button>
        </div>
      ) }

      { /* START ACTIVE CALL */ }
      { !!(connection && connection.item && !connection.call) && (
        <div className="btn-group me-2">
          <button className="btn btn-primary" onClick={ (e) => onCall(e) } data-toggle="tooltip" title="Start Call">
            <i className={ `fat fa-phone` } />
          </button>
        </div>
      ) }

      { /* DIALLER */ }
      { !!connection && (
        <div className="btn-group me-2">
          { connection.dialler ? (
            <button className="btn btn-primary" data-toggle="tooltip" title="Dialler Status">
              { ucFirst(connection.dialler.status) } - 
              { connection.dialler.dialled?.length || 0 } of { connection.count }
            </button>
          ) : (
            <button className="btn btn-primary" onClick={ (e) => onDialler(e) } data-toggle="tooltip" title="Start Dialler">
              <i className="fat fa-play me-2" />
              Dialler
            </button>
          ) }
          { connection.dialler?.status === 'dialling' && (
            <>
              <button className="btn btn-info" onClick={ (e) => onNext(e) } data-toggle="tooltip" title="Next Call">
                <i className="fa fa-forward" />
              </button>
              <button className="btn btn-danger" onClick={ (e) => onPause(e) } data-toggle="tooltip" title="Pause Dialler">
                <i className="fa fa-pause" />
              </button>
            </>
          ) }
          { connection.dialler?.status === 'paused' && (
            <>
              <button className="btn btn-success" onClick={ (e) => onPlay(e) } data-toggle="tooltip" title="Start Dialler">
                <i className="fa fa-play" />
              </button>
              <button className="btn btn-danger" onClick={ (e) => onFinish(e) } data-toggle="tooltip" title="End Dialler">
                <i className="fa fa-times" />
              </button>
            </>
          ) }
          { connection.dialler?.status === 'finished' && (
            <button className="btn btn-danger" onClick={ (e) => onFinish(e) } data-toggle="tooltip" title="End Dialler">
              <i className="fa fa-times" />
            </button>
          ) }
        </div>
      ) }

      { props.dashup.can(props.page, 'submit') && !!props.getForms().length && (
        props.getForms().length > 1 ? (
          <Dropdown>
            <Dropdown.Toggle variant="primary" id="dropdown-create" className="me-2">
              <i className="fat fa-plus me-2" />
              Create
            </Dropdown.Toggle>

            <Dropdown.Menu>
              { props.getForms().map((form) => {

                // return jsx
                return (
                  <Dropdown.Item key={ `create-${form.get('_id')}` } onClick={ (e) => !props.setForm(form.get('_id')) && props.setItem(new props.dashup.Model({}, props.dashup), true) }>
                    <i className={ `me-2 fa-${form.get('icon') || 'pencil fas'}` } />
                    { form.get('name') }
                  </Dropdown.Item>
                );
              }) }
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <button className="btn btn-primary me-2" onClick={ (e) => !props.setForm(props.getForms()[0].get('_id')) && props.setItem(new props.dashup.Model({}, props.dashup), true) }>
            <i className={ `me-2 fa-${props.getForms()[0].get('icon') || 'pencil fas'}` } />
            { props.getForms()[0].get('name') }
          </button>
        )
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
      
    </>
  );
};

// export default
export default PhonePageMenu;
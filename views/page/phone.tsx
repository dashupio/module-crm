
import Measure from 'react-measure';
import shortid from 'shortid';
import GridLayout from 'react-grid-layout';
import { Page, Block } from '@dashup/ui';
import { Modal, Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';

// import scss
import './phone.scss';

// import local
import Menu from './phone/menu';
import phone from './phone.ts';

// application page
const PhonePage = (props = {}) => {
  // groups
  const [menu, setMenu] = useState(false);
  const [width, setWidth] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(false);
  const [remove, setRemove] = useState(null);
  const [bConfig, setBConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(new Date());
  const [numbers, setNumbers] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [connection, setConnection] = useState(null);

  // default blocks
  const defaultBlocks = [
    {
      uuid  : shortid(),
      type  : 'card',
      _grid : {
        x : 6,
        y : 0,
        w : 3,
        h : 2,
      },
    },
    {
      uuid  : shortid(),
      type  : 'form',
      _grid : {
        x : 2,
        y : 0,
        w : 4,
        h : 6,
      },
    },
    {
      uuid  : shortid(),
      type  : 'events',
      _grid : {
        x : 6,
        y : 2,
        w : 6,
        h : 4,
      },
      background : true,
    },
    {
      uuid  : shortid(),
      type  : 'contact',
      _grid : {
        x : 9,
        y : 0,
        w : 3,
        h : 2,
      },
    },
    {
      uuid  : shortid(),
      type  : 'list',
      _grid : {
        x : 0,
        y : 0,
        w : 2,
        h : 6,
      },
      background : true,
    },
  ];

  // check blocks
  if (typeof props.page.get('data.blocks') === 'undefined') {
    props.page.set('data.blocks', defaultBlocks);
  }

  // on fields
  const setBlocks = (blocks, prevent = false) => {
    // prevent
    if (!prevent) {
      // on fields
      return props.setData('blocks', [...blocks]);
    } else {
      // without save
      return props.page.set('data.blocks', [...blocks]);
    }
  };

  // set page
  const setBlock = async (block, key, value, prevent) => {
    // new blocks
    const newBlocks = props.page.get('data.blocks') || [];

    // updates
    let updates = {
      [key] : value,
    };

    // find field
    const actualField = newBlocks.find((b) => b.uuid === block.uuid);

    // fix obj
    if (typeof key === 'object') {
      updates = key;
      prevent = value;
    }

    // loading
    setSaving(true);

    // set to field
    Object.keys(updates).forEach((k) => {
      actualField[k] = updates[k];
    });
    
    // set page
    await setBlocks(newBlocks, prevent);

    // loading
    setSaving(false);
  };

  // create block
  const onCreate = async (type) => {
    // create block
    const newBlock = {
      type,
      uuid  : shortid(),
      _grid : {
        w : 3,
        h : 10,
        x : 0,
        y : (props.page.get('data.blocks') || []).reduce((top, block) => {
          // check above
          if (block?._grid?.w && (block._grid.w + block._grid.y) > top) return (block._grid.w + block._grid.y) + 1;

          // default top
          return top;
        }, 0),
      },
    };
    
    // set page
    setMenu(false);
    await setBlocks([...(props.page.get('data.blocks') || []), newBlock]);
  };

  // on remove
  const onRemove = async (block) => {
    // remove block
    const newBlocks = (props.page.get('data.blocks') || []).filter((b) => b.uuid !== block.uuid);

    // loading
    setRemove(null);
    setSaving(true);
    
    // set page
    await setBlocks(newBlocks);

    // loading
    setSaving(false);
  };

  // get props
  const getProps = () => {
    // new props
    const newProps = { ...props };

    // return new props
    delete newProps.view;
    delete newProps.type;
    delete newProps.struct;
    delete newProps.children;

    // return new props
    return newProps;
  };

  // on layout
  const onLayout = (layout) => {
    // new blocks
    const newBlocks = props.page.get('data.blocks');
    let requireUpdate = false;

    // update
    layout.forEach((item) => {
      // find item
      const actualItem = newBlocks.find((b) => b.uuid === item.i);

      // find match
      const shouldUpdate = ['w', 'h', 'x', 'y'].find((key) => {
        return actualItem._grid[key] !== item[key];
      });

      // check return
      if (!shouldUpdate) return;

      // require update
      requireUpdate = true;

      // set values
      actualItem._grid = item;
      delete actualItem._grid.i;
    });

    // save blocks
    if (!requireUpdate) return;

    // set blocks
    setBlocks(newBlocks);
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
  
  // remove jsx
  const removeJsx = remove && (
    <Modal show onHide={ (e) => setRemove(null) }>
      <Modal.Header closeButton>
        <Modal.Title>
          Removing <b>{ remove.label || remove.uuid }</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="lead">
          Are you sure you want to remove <b>{ remove.label || 'this Block' }</b>?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={ (e) => !setRemove(null) && e.preventDefault() }>
          Close
        </Button>
        <Button variant="danger" className="ms-2" onClick={ (e) => onRemove(remove) }>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // return jsx
  return (
    <Page { ...props } bodyClass="flex-column">

      <Page.Config show={ config } onHide={ (e) => setConfig(false) } />

      <Page.Menu onConfig={ () => setConfig(true) } onShare>
        <Menu updating={ updating } phone={ phone } numbers={ numbers } connection={ connection } { ...props } />

        { updating && props.dashup.can(props.page, 'manage') && (
          <button className="me-2 btn btn-primary" onClick={ () => setMenu(true) }>
            <i className="fa fa-plus me-2" />
            Add Block
          </button>
        ) }
        { props.dashup.can(props.page, 'manage') && (
          <button className={ `me-2 btn btn-${!updating ? 'link text-dark' : 'primary'}` } onClick={ (e) => setUpdating(!updating) }>
            <i className={ `fat fa-${!updating ? 'pencil' : 'check'} me-2` } />
            { !updating ? 'Update Grid' : 'Finish Updating' }
          </button>
        ) }
      </Page.Menu>
      SUB MENU
      <Page.Body>
        <div className="flex-1 fit-content">
          <Measure bounds onResize={ ({ bounds }) => setWidth(parseInt(bounds.width, 10)) }>
            { ({ measureRef }) => {
              // return jsx
              return (
                <div ref={ measureRef }>
                  { width > 0 && (
                    <GridLayout
                      layout={ (props.page.get('data.blocks') || []).map((block) => {
                        // return block
                        return {
                          ...block._grid,
                          i : block.uuid,
                        };
                      }) }
                      cols={ 12 }
                      width={ width }
                      rowHeight={ 30 }
                      className="layout"
                      isDraggable={ props.dashup.can(props.page, 'manage') && updating }
                      isResizable={ props.dashup.can(props.page, 'manage') && updating }
                      onLayoutChange={ onLayout }
                      containerPadding={ [0, 0] }
                      >
                      { (props.page.get('data.blocks') || []).map((block, i) => {
                        // return block
                        return (
                          <div key={ block.uuid } className="dashup-block">
                            <Block block={ block } updating={ updating } onConfig={ setBConfig } onRemove={ setRemove } setBlock={ setBlock } model={ props.page.get('data.model') } { ...getProps() } />
                          </div>
                        );
                      }) }
                    </GridLayout>
                  ) }
                </div>
              );
            } }
          </Measure>
        </div>
        { bConfig && <Block.Config show block={ bConfig } onRemove={ setRemove } model={ props.page.get('data.model') } setBlock={ setBlock } onHide={ () => setBConfig(null) } { ...getProps() } /> }
        <Block.Menu show={ menu } available={ props.available.blocks } onBlock={ onCreate } onHide={ () => setMenu(false) } />
        { removeJsx }
      </Page.Body>
    </Page>
  );
};

// export default
export default PhonePage;
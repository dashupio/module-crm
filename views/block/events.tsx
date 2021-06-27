
// import react
import ReactPerfectScrollbar from 'react-perfect-scrollbar';
import React, { useState, useEffect } from 'react';

// import item
import Item from './events/item';

// block events
const BlockEvents = (props = {}) => {
  // use state
  const [skip, setSkip] = useState(0);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
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
    delete newProps.item;
    delete newProps.type;
    delete newProps.model;
    delete newProps.struct;

    // return new props
    return newProps;
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
      { !!props.block.label && (
        <div className={ props.block.background ? ' mb-2' : 'card-header' }>
          <b>{ props.block.name }</b>
        </div>
      ) }
      
      <ReactPerfectScrollbar className={ `flex-column flex-1${props.block.background ? ' card-body' : ''} p-relative` }>
        { loading ? (
          <div className="text-center">
            <i className="fa fa-spinner fa-spin" />
          </div>
        ) : (items || []).map((item, i) => {
          // return jsx
          return (
            <Item key={ `event-${item.get('_id')}` } item={ item } model={ getModel() } { ...getProps() } />
          );
        }) }
      </ReactPerfectScrollbar>
    </div>
  );
};

// export default
export default BlockEvents;
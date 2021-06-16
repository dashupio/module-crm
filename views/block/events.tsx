
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
    // get model page
    const model = getModel();

    // check model page
    if (!model) return null;

    // get model page
    const modelPage = props.dashup.page(model);

    // get query
    const query = props.getQuery(modelPage);
    
    // list
    return {
      data  : await query.skip(skip).limit(limit).listen(),
      total : await props.getQuery(modelPage).count(),
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

    // load data
    loadData().then(({ data, total }) => {
      // on update
      data.on('update', onUpdate);

      // set data
      setItems(data);
      setLoading(false);
    });

    // return nothing
    return () => {
      // items
      if (!items.removeListener) return;

      // remove listener
      items.deafen();
      items.removeListener('update', onUpdate);
    };
  }, [props.block.model, props.model, skip, limit]);

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
        ) : items.map((item, i) => {
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
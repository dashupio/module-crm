
import shortid from 'shortid';
import { View, Page } from '@dashup/ui';
import React, { useState } from 'react';

// application page
const BulkPage = (props = {}) => {
  // groups
  const [form, setForm] = useState(null);
  const [selected, setSelected] = useState({ type : 'items', items : [] });
  const [updating, setUpdating] = useState(null);

  // required
  const required = [{
    key   : 'data.model',
    label : 'Contact Model',
  }, {
    key   : 'data.event.model',
    label : 'Event Model',
  }];

  // default blocks
  const defaultBlocks = [
    {
      uuid  : shortid(),
      type  : 'grid',
      _grid : {
        x : 0,
        y : 1,
        w : 6,
        h : 22,
      },
    },
    {
      uuid    : shortid(),
      type    : 'chart',
      color   : 'success',
      model   : props.page.get('data.event.model') || null,
      metric  : 'sum',
      display : '{{ value }} Opens',
      _grid : {
        x : 0,
        y : 0,
        w : 3,
        h : 6
      },
    },
    {
      uuid    : shortid(),
      type    : 'chart',
      color   : 'primary',
      model   : props.page.get('data.event.model') || null,
      metric  : 'count',
      filter  : '[{"type":{"$eq":"email:outbound"}}]',
      display : '{{ value }} Sent',
      _grid : {
        x : 3,
        y : 0,
        w : 3,
        h : 6
      },
    },
    {
      uuid       : shortid(),
      type       : 'bulk',
      background : true,
      _grid : {
        x : 6,
        y : 0,
        w : 6,
        h : 28
      },
    },
  ];

  // check blocks
  if (typeof props.page.get('data.blocks') === 'undefined') {
    props.page.set('data.blocks', defaultBlocks);
  }

  // set sort
  const setSort = async (column, way = 1) => {
    // let sort
    let sort;

    // check field
    if (
      column && props.page.get('data.sort') &&
      ((column.field !== 'custom' && column.field === props.page.get('data.sort.field')) ||
      (column.field === 'custom' && column.sort === props.page.get('data.sort.sort')))
    ) {
      // reverse sort
      if (props.page.get('data.sort.way') === -1) {
        column = null;
      } else {
        way = -1;
      }
    }
    
    // set sort
    if (!column) {
      sort = null;
    } else {
      // create sort
      sort = {
        way,
  
        id    : column.id,
        sort  : column.sort,
        field : column.field,
      };
    }

    // set data
    await props.setData('sort', sort);
  };

  // set tag
  const setTag = async (field, value) => {
    // set tag
    let tags = (props.page.get('user.filter.tags') || []).filter((t) => typeof t === 'object');

    // check tag
    if (tags.find((t) => t.field === field.uuid && t.value === (value?.value || value))) {
      // exists
      tags = tags.filter((t) => t.field !== field.uuid || t.value !== (value?.value || value));
    } else {
      // push tag
      tags.push({
        field : field.uuid,
        value : (value?.value || value),
      });
    }

    // set data
    await props.setUser('filter.tags', tags);
  };

  // set search
  const setSearch = (search = '') => {
    // set page data
    props.page.set('user.search', search.length ? search : null);
  };

  // set filter
  const setFilter = async (filter) => {
    // set data
    props.setUser('query', filter, true);
  };

  // set item
  const setItem = (item, force = false) => {
    // set item
    force = force || (props.item && props.item.get('_id') === item.get('_id'));

    // set item
    if (!props.item || props.item.get('_id') !== item.get('_id')) props.setItem(item);

    // if force
    if (force) setUpdating(true);
  };

  // return jsx
  return (
    <View
      { ...props }
      type="page"
      view="view"
      form={ form }
      struct="dashboard"
      onItem={ (item) => setItem(item, true) }
      require={ required }
      onClick={ setItem }
      selected={ selected }
      setSelected={ setSelected }

      menu={ ({ updating }) => (
        <div />
      ) }
      subMenu={ () => (
        <>
          <Page.Filter onSearch={ setSearch } onTag={ setTag } onSort={ setSort } onFilter={ setFilter } isString />
          { !!props.item && !!updating && <Page.Item show item={ props.item } form={ form } setItem={ props.setItem } onHide={ (e) => !setUpdating(false) && props.setItem(null) } /> }
        </>
      ) }
      />
  );
};

// export default
export default BulkPage;
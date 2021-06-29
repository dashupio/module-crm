
import shortid from 'shortid';
import { View, Page } from '@dashup/ui';
import React, { useState, useEffect } from 'react';

// import local
import Menu from './phone/menu';
import phone from './phone.ts';

// application page
const PhonePage = (props = {}) => {
  // groups
  const [form, setForm] = useState(null);
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
      type  : 'card',
      _grid : {
        x : 6,
        y : 0,
        w : 3,
        h : 8,
      },
    },
    {
      uuid  : shortid(),
      type  : 'form',
      _grid : {
        x : 2,
        y : 0,
        w : 4,
        h : 30,
      },
    },
    {
      uuid  : shortid(),
      type  : 'events',
      _grid : {
        x : 6,
        y : 2,
        w : 6,
        h : 22,
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
        h : 8,
      },
    },
    {
      uuid  : shortid(),
      type  : 'list',
      _grid : {
        x : 0,
        y : 0,
        w : 2,
        h : 30,
      },
      background : true,
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

      menu={ ({ updating }) => (
        <Menu updating={ updating } phone={ phone } setForm={ setForm } { ...props } />
      ) }
      subMenu={ () => (
        <>
          <Page.Filter onSearch={ setSearch } onTag={ setTag } onSort={ setSort } onFilter={ setFilter } isString />
          { !!props.item && !!updating && <Page.Item show item={ props.item } form={ form } setItem={ props.setItem } onHide={ (e) => setUpdating(false) } /> }
        </>
      ) }
      />
  );
};

// export default
export default PhonePage;
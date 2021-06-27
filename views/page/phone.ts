// import event emitter
import { Device } from 'twilio-client';
import { EventEmitter } from 'events';

/**
 * phone
 */
class PhoneModule extends EventEmitter {
  /**
   * constructor
   */
  constructor() {
    // run super
    super();

    // connections
    this.connections = new Map();

    // bind init
    this.init = this.init.bind(this);

    // status interval
    this.__status = setInterval(() => {
      // connection values
      Array.from(this.connections.values()).forEach((connection) => {
        try {
          // check status
          if (connection.device.status() !== connection.status) {
            // set status
            connection.status = connection.device.status();
            this.emit('update');
          }

          // set status
          if (connection.call && connection.conn && connection.conn.status() !== connection.call.status) {
            // set status
            connection.call.status = connection.conn.status();
            this.emit('update');
          }
        } catch (e) {}
      });
    }, 1000);
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // INIT METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * init page
   *
   * @param page 
   */
  async init({ props }) {
    // check connections
    if (this.connections.has(props.page.get('_id'))) return this.connections.get(props.page.get('_id'));

    // set connection
    this.connections.set(props.page.get('_id'), {
      call   : null,
      item   : props.current,
      device : new Device(),
      status : 'connecting',
    });

    // create conn
    const conn = this.connections.get(props.page.get('_id'));
    
    // update
    const { token } = await props.page.action('auth');

    // setup
    await conn.device.setup(token, {
      debug : false,
    });

    // setup
    conn.device.on('incoming', async (connection) => {
      // get fields
      const fields = this.getFields(props);

      // set query
      const query = this.getQuery(props);

      // connection
      const conn = this.connections.get(props.page.get('_id'));
    
      // get number
      const numberField = fields.find((f) => f.uuid === props.page.get('data.field.phone'));

      // find or create number
      const item = await query.where({
        [`${numberField.name || numberField.uuid}.number`] : connection.parameters.From,
      }).findOne() || await props.dashup.page(props.page.get('data.model')).create({
        [`${numberField.name || numberField.uuid}.number`] : connection.parameters.From,
      });

      // emit connection
      conn.call = {
        to     : connection.parameters.From,
        from   : connection.parameters.To,
        type   : 'inbound',
        start  : new Date(),
        muted  : false,
        status : 'calling',
      };
      conn.item = item;
      conn.conn = connection;

      // on disconnect
      conn.conn.on('reject', () => this.onDisconnect(props, item));
      conn.conn.on('disconnect', () => this.onDisconnect(props, item));
  
      // on disconnect
      conn.conn.on('mute', (muted) => {
        // set muted
        conn.call.muted = muted;
        this.emit('update');
      });
    
      // emit update
      this.emit('update');
      this.emit('inbound', conn);
    });

    // return connection
    return conn;
  }


  // ////////////////////////////////////////////////////////////////////////////
  //
  // CALL METHODS
  //
  // ////////////////////////////////////////////////////////////////////////////

  /**
   * end call
   */
  end(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // check connection
    if (conn.conn) {
      // disconnect call
      conn.conn.disconnect();
    }
  }

  /**
   * end call
   */
  async start(props, item) {
    // props
    const { page, dashup } = props;

    // get fields
    const fields = this.getFields(props);
    
    // get fields
    const numberField = fields.find((f) => f.uuid === page.get('data.field.phone'));

    // connection
    const conn = this.connections.get(page.get('_id'));

    // count
    conn.count = await this.getQuery(props).count();
    
    // check number
    if (!conn.number) {
      // error
      return eden.alert.error('Please purchase or select a number to initalize calls');
    }
    
    // check number
    if (!item) {
      // error
      return eden.alert.error('Please select an item to make a call');
    }
    
    // check number
    if (!numberField) {
      // error
      return eden.alert.error('Please ensure the page config specifies a "phone" field');
    }

    // get number
    const number = item.get(`${numberField.name || numberField.uuid}.number`);

    // set call
    conn.call = {
      to     : number,
      from   : conn.number,
      type   : 'outbound',
      start  : new Date(),
      muted  : false,
      status : 'calling',
    };
    conn.item = item;
    
    // create call event
    conn.event = await this.event(props, {
      item,

      to    : number,
      from  : conn.number,
      time  : new Date(),
      type  : `call:${conn.call.type}`,
      title : `Called ${number}`,
    });

    // create connection
    conn.conn = conn.device.connect({
      to       : number,
      item     : item.get('_id'),
      from     : conn.number,
      page     : page.get('_id'),
      event    : conn.event.get('_id'),
      agent    : (eden ? eden.user.get('_id') : 'Anonymous'),
      member   : dashup.get('_meta.member'),
      dashup   : dashup.get('_id'),
      location : dashup.get('_id'),
    });

    // on disconnect
    conn.conn.on('disconnect', () => this.onDisconnect(props, item));

    // on disconnect
    conn.conn.on('mute', (muted) => {
      // set muted
      conn.call.muted = muted;
      this.emit('update');
    });

    // return conn
    return conn;
  }

  /**
   * on disconnect
   *
   * @param conn 
   * @param item 
   */
  async onDisconnect(props, item) {
    // props
    const { page, dashup } = props;

    console.log(page, props, 'disconnect');

    // connection
    const conn = this.connections.get(page.get('_id'));

    // get fields
    const fields = this.getFields(props);
    const eventFields = this.getFields(props, [page.get('data.event.form')]);

    // user field
    const userField = fields.find((f) => f.uuid === page.get('data.user.0'));
    const dateField = eventFields.find((f) => f.uuid === page.get('data.event.date'));

    // unset call
    conn.call = null;
    conn.conn = null;

    // check event
    if (conn.event) {
      // duration
      const duration = (new Date().getTime() - new Date(conn.event.get(`_meta.created_at`)).getTime());

      // set duration
      conn.event.set(`${dateField.name || dateField.uuid}.dur.type`, 'until');
      conn.event.set(`${dateField.name || dateField.uuid}.duration`, duration);
      await conn.event.save();

      // check duration
      if (userField && duration > (30 * 1000)) {
        // auto assign
        item.set(userField.name || userField.uuid, dashup.get('_meta.member'));
      }
    }

    // save item
    await item.save();

    // check status
    if (conn.dialler) conn.dialler.status = 'paused';

    // emit
    this.emit('modal');

    // emit update
    this.emit('update');
  }

  /**
   * send sms
   *
   * @param props 
   * @param item 
   * @param body 
   */
  async sms(props, item, body) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // get fields    
    const fields = this.getFields(props);

    // get number
    const numberField = fields.find((f) => f.uuid === props.page.get('data.field.phone'));

    // check number
    if (!numberField) return;

    // get number
    const number = item.get(`${numberField.name || numberField.uuid}.number`);

    // send from/to
    await props.page.action('send', {
      body,
      to   : number,
      from : conn.number,
    });

    // add event
    await this.event(props, {
      body,
      item,
      to    : number,
      from  : conn.number,
      type  : 'sms:outbound',
      time  : new Date(),
      title : `Sent SMS To ${number}`,
    });
  }

  /**
   * set item
   *
   * @param props 
   * @param item 
   */
  item(props, item) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // set number
    conn.item = item;
    this.emit('update');
    this.emit('item', conn.item);

    // on item
    props.onItem(null, item, false);
  }

  /**
   * set number
   *
   * @param props 
   * @param number 
   */
  press(props, btn) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // check connection
    if (!conn.conn) return;
    
    // send number
    conn.conn.sendDigits(btn);
  }

  /**
   * set number
   *
   * @param props 
   * @param number 
   */
  number(props, number) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // set number
    conn.number = number;
    this.emit('update');
  }

  /**
   * create dialler
   *
   * @param props 
   * @param id 
   */
  async dialler(props, id) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // count
    conn.count = await this.getQuery(props).count();

    // set number
    if (!conn.dialler || conn.dialler.id !== id) {
      // set dialler
      conn.dialler = {
        id,
        start   : new Date(),
        index   : 0,
        status  : 'paused',
        dialled : [],
      };
    }
    this.emit('update');
  }

  /**
   * go next
   *
   * @param props
   */
  async next(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
    const forms = this.getForms(props);
    const fields = this.getFields(props, forms);

    // check item
    if (conn.item && conn.dialler.dialled && !conn.dialler.dialled.includes(conn.item.get('_id'))) {
      // add to used
      conn.dialler.dialled.push(conn.item.get('_id'));
    }

    // let sort
    let way = props.page.get('data.sort.way') || 1;
    let sort = 'created_at';

    // check sort
    if (props.page.get('data.sort.id')) {
      // get field
      const sortField = props.page.get('data.sort.sort') ? {
        name : props.page.get('data.sort.sort'),
      } : fields.find((f) => f.uuid === props.page.get('data.sort.id'));

      // sort by that
      if (sortField) {
        // sort
        way = props.page.get('data.sort.way') === 1 ? 1 : -1;
        sort = sortField.name || sortField.uuid;
      }
    }

    // check dialler
    if (!conn.dialler) return;

    // check connection
    if (conn.conn) return conn.conn.disconnect();

    // get query
    let query = this.getQuery(props);

    // load where nin
    if (conn.dialler.dialled.length) {
      // not in
      query = query.nin('_id', conn.dialler.dialled);
    }

    // gt
    if (conn.item) {
      // get value
      let val = conn.item.get(sort);

      // check sort
      if (sort === 'created_at') val = conn.item.get('_meta.created_at');
      if (sort === 'updated_at') val = conn.item.get('_meta.updated_at');

      // query
      query = query[way === -1 ? 'lte' : 'gte'](sort, val);
    }

    // set item
    conn.item = await query.findOne();

    // on item
    props.onItem(null, conn.item, false);

    // check item
    if (!conn.item) {
      // set status
      conn.dialler.status = 'finished';
      return this.emit('update');
    }

    // add to dialled
    conn.dialler.dialled.push(conn.item.get('_id'));
    this.emit('update');
    this.emit('item', conn.item);

    // call
    this.start(props, conn.item);
  }

  /**
   * pause dialler
   *
   * @param props 
   */
  play(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialler) {
      // paused
      conn.dialler.status = 'dialling';
    }

    // next
    if (conn.item) {
      this.start(props, conn.item);
    } else {
      this.next(props);
    }
  }

  /**
   * pause dialler
   *
   * @param props 
   */
  pause(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialler) {
      // paused
      conn.dialler.status = 'paused';
    }
    this.emit('update');
  }

  /**
   * pause dialler
   *
   * @param props 
   */
  finish(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialler) {
      // paused
      delete conn.dialler;
    }
    this.emit('update');
  }

  /**
   * creates event
   *
   * @param props 
   * @param param1 
   */
  async event(props, opts) {
    // destruct
    const { _id, title, from, to, type, item, body, time, duration } = opts;

    // get item id
    const itemID = item.get('_id');

    // get fields
    const fields = this.getFields(props, [props.page.get('data.event.form')]);

    // get fields
    const toField = this.getField(props, 'to', fields) || {};
    const typeField = this.getField(props, 'type', fields) || {};
    const itemField = this.getField(props, 'item', fields) || {};
    const bodyField = this.getField(props, 'body', fields) || {};
    const dateField = this.getField(props, 'date', fields) || {};
    const userField = this.getField(props, 'user', fields) || {};
    const fromField = this.getField(props, 'from', fields) || {};
    const titleField = this.getField(props, 'title', fields) || {};

    // create event
    const newEvent = await props.dashup.action({
      type   : 'page',
      page   : props.page.get('data.event.form'),
      form   : props.page.get('data.event.form'),
      model  : props.page.get('data.event.model'),
      struct : 'form',
    }, 'form.submit', {
      _id,

      [toField.name || toField.uuid] : to,
      [fromField.name || fromField.uuid] : from,
      [itemField.name || itemField.uuid] : itemID,
      [userField.name || userField.uuid] : props.dashup.get('_meta.member'),
      [typeField.name || typeField.uuid] : type,
      [bodyField.name || bodyField.uuid] : body,
      [dateField.name || dateField.uuid] : {
        start : time,
        duration,
        dur : {
          type : 'until',
        },
      },
      [titleField.name || titleField.uuid] : title,
    });

    // event
    if (newEvent && typeof newEvent !== props.dashup.Model) {
      // return model
      return new props.dashup.Model(newEvent, props.dashup);
    }

    // return event
    return newEvent;
  }

  /**
   * get selected model
   */
  getModel(props) {
    // check model
    return props.page.get('data.model');
  }

  /**
   * get selected forms
   */
  getForms(props) {
    // forms
    let form = props.page.get('data.form');
    let forms = props.page.get('data.forms') || [];

    // check form
    if (!forms.length && form) forms = [form];
    if (!forms.length && forms) forms = forms;

    // return forms
    return forms;
  }

  /**
   * get field
   */
  getField(props, name, fields, tld = 'event') {
    // return value
    return fields.find((field) => {
      // return fields
      return field.uuid === props.page.get(`data.${tld}.${name}`);
    });
  }

  /**
   * get fields
   */
  getFields(props, forms = null) {
    // check props
    if (!forms) forms = this.getForms(props);

    // return fields
    return Array.from(props.dashup.get('pages').values()).filter((page) => {
      // return model pages
      return page.get('type') === 'form' && forms.includes(page.get('_id')) && !page.get('archived');
    }).reduce((accum, page) => {
      // fields
      accum.push(...(page.get('data.fields') || []));
      
      // return accum
      return accum;
    }, []);
  }

  /**
   * get query
   */
  getQuery(props) {
    // get model
    const model = this.getModel(props);
    const forms = this.getForms(props);
    const fields = this.getFields(props, forms);

    // set query
    let query = props.dashup.page(model);

    // check items
    if (forms.length) {
      // loop forms
      query = query.in('_meta.form', forms);
    }

    // load filter
    let filter = null;

    // check page filter
    if (props.page.get('data.model') === model) {
      // try/catch
      try {
        filter = JSON.parse(props.page.get('data.filter'));
      } catch (e) {}
    }
    
    // try/catch
    try {
      filter = JSON.parse(props.block.filter);
    } catch (e) {}

    // add initial where
    if (filter) {
      // add wheres
      filter.forEach((where) => {
        // where
        query = query.where(where);
      });
    }

    // search
    if (props.search && props.search.length) {
      // add search
      query = query.search(props.search);
    }

    // test by user
    if ((props.page.get('user.filter') || {}).me) {
      // get user fields
      const userFields = (fields || []).filter((f) => (props.page.get('data.user') || []).includes(f.uuid));
      
      // loop fields
      query = query[userFields.length > 1 ? 'or' : 'where'](...(userFields.map((userField) => {
        // return or
        return {
          [userField.name || userField.uuid] : props.dashup.get('_meta.member'),
        };
      })));
    }

    // user query
    (props.page.get('user.where') || []).forEach((where) => {
      // types
      const numberTypes = ['gt', 'lt', 'gte', 'lte'];

      // add query
      query = query[where[0]](where[1], numberTypes.includes(where[0]) ? parseFloat(where[2]) : where[2]);
    });

    // check vals
    const tagFields = (fields || []).filter((f) => (props.page.get('data.tag') || []).includes(f.uuid));

    // get tags
    const userTags = (props.page.get('user.filter.tags') || []).filter((id) => {
      // return find
      return tagFields.find((t) => {
        // check id
        return (t.options || []).find((o) => o.value === id);
      });
    });

    // get filter tags
    if (userTags.length) {
      // loop fields
      query = query[tagFields.length > 1 ? 'or' : 'where'](...(tagFields.map((tagField) => {
        // return or
        return {
          [tagField.name || tagField.uuid] : userTags,
        };
      })));
    }

    // check sort
    if (props.page.get('data.sort.id')) {
      // get field
      const sortField = props.page.get('data.sort.sort') ? {
        name : props.page.get('data.sort.sort'),
      } : fields.find((f) => f.uuid === props.page.get('data.sort.id'));

      // sort by that
      if (sortField) query = query.sort(sortField.name || sortField.uuid, props.page.get('data.sort.way'));
    }

    // return query
    return query;
  }
}

// create phone module
const phoneModule = eden.phone || new PhoneModule();

// set to eden
eden.phone = phoneModule;

// Create mixin
export default phoneModule;
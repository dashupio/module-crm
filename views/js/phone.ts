
// import event emitter
import moment from 'moment';
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

    // status interval
    this.__status = setInterval(() => {
      // connection values
      Array.from(this.connections.values()).forEach((connection) => {
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
      device : new Device(),
      status : 'connecting',
    });
    const conn = this.connections.get(props.page.get('_id'));
    
    // update
    const { token } = await props.page.action('auth');

    // setup
    conn.device.setup(token, {
      debug : true,
    });

    // setup
    conn.device.on('incoming', async (conn) => {
      // set query
      let query = props.dashup.page(props.page.get('data.model'));

      // check items
      if (props.page.get('data.forms')) {
        // loop forms
        query = query.in('_meta.form', props.page.get('data.forms'));
      }
    
      // get number
      const numberField = props.context.fields.find((f) => f.uuid === props.page.get('data.field.phone'));

      // find or create number
      const item = await query.where({
        [numberField.name || numberField.uuid] : conn.parameters.From,
      }).findOne() || await props.dashup.page(props.page.get('data.model')).create({
        [numberField.name || numberField.uuid] : conn.parameters.From,
      });

      // emit connection
      conn.call = {
        to     : conn.parameters.From,
        from   : conn.parameters.To,
        type   : 'inbound',
        start  : new Date(),
        muted  : false,
        status : 'calling',
      };
      conn.item = item;
      conn.conn = conn;
    
      // emit update
      this.emit('update');
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
  end ({ page }) {
    // connection
    const conn = this.connections.get(page.get('_id'));

    // check connection
    if (conn.conn) {
      // disconnect call
      conn.conn.disconnect();
    }
  }

  /**
   * end call
   */
  async start (props, item) {
    // props
    const { page, context, dashup } = props;

    // connection
    const conn = this.connections.get(page.get('_id'));
    
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
    
    // get number
    const numberField = context.fields.find((f) => f.uuid === page.get('data.field.phone'));
    
    // check number
    if (!numberField) {
      // error
      return eden.alert.error('Please ensure the page config specifies a "phone" field');
    }

    // get number
    const number = item.get(numberField.name || numberField.uuid);

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
    conn.conn = conn.device.connect({
      to       : number,
      item     : item.get('_id'),
      from     : conn.number,
      page     : page.get('_id'),
      agent    : (eden ? eden.user.get('_id') : 'Anonymous'),
      member   : dashup.get('_meta.member'),
      dashup   : dashup.get('_id'),
      location : dashup.get('_id'),
    });
    
    // create call event
    conn.event = await this.event(props, {
      to    : number,
      from  : conn.number,
      time  : new Date(),
      type  : `call:${conn.call.type}`,
      item  : item.get('_id'),
      title : `Called ${number}`,
    });

    // on disconnect
    conn.conn.on('disconnect', async () => {
      // get fields
      const fields = this.fields(props);
      const time = this.field(props, 'time', fields);

      // unset call
      conn.call = null;
      conn.conn = null;

      // duration
      if (time) {
        // set duration
        conn.event.set('duration', (new Date().getTime() - new Date(conn.event.get(time.name || time.uuid)).getTime()));
        conn.event.save();
      }

      // on disconnect
      if (conn.dialer) {
        // check status
        if (conn.dialer.status === 'dialing') {
          // next
          this.next(props);
        }
      }

      // emit update
      this.emit('update');
    });

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
   * send sms
   *
   * @param props 
   * @param item 
   * @param body 
   */
  async sms(props, item, body) {
    // connection
    const conn = this.connections.get(page.get('_id'));

    // get number
    const numberField = props.context.fields.find((f) => f.uuid === props.page.get('data.field.phone'));

    // check number
    if (!numberField) return;

    // get number
    const number = item.get(numberField.name || numberField.uuid);

    // send from/to
    await props.page.action('send', {
      body,
      to   : number,
      from : conn.number,
    });

    // add event
    await this.event(props, {
      body,
      to    : number,
      from  : conn.number,
      type  : 'sms:outbound',
      item  : item.get('_id'),
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
   * create dialer
   *
   * @param props 
   * @param id 
   */
  dialer(props, id) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // set number
    if (!conn.dialer || conn.dialer.id !== id) {
      // set dialer
      conn.dialer = {
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
  next(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));

    // check connection
    if (conn.conn) return conn.conn.disconnect();

    // set item
    conn.item = [...(this.items(props) || [])].filter((item) => !conn.dialer.dialled.includes(item.get('_id')))[0];

    // check item
    if (!conn.item) {
      // set status
      conn.dialer.status = 'finished';
      return this.emit('update');
    }

    // add to dialled
    conn.dialer.dialled.push(conn.item.get('_id'));
    this.emit('update');
    this.emit('item', conn.item);

    // call
    this.start(props, conn.item);
  }

  /**
   * pause dialer
   *
   * @param props 
   */
  play(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialer) {
      // paused
      conn.dialer.status = 'dialing';
    }

    // next
    this.next(props);
  }

  /**
   * pause dialer
   *
   * @param props 
   */
  pause(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialer) {
      // paused
      conn.dialer.status = 'paused';
    }
    this.emit('update');
  }

  /**
   * pause dialer
   *
   * @param props 
   */
  finish(props) {
    // connection
    const conn = this.connections.get(props.page.get('_id'));
   
    // set status
    if (conn.dialer) {
      // paused
      delete conn.dialer;
    }
    this.emit('update');
  }

  /**
   * loads phone stats
   *
   * @param props 
   */
  async stats(props) {
    // get event model
    const eventModel = props.page.get('data.event.model');

    // get fields
    const fields = this.fields(props);

    // event model
    if (!eventModel) return;

    // yesterday
    const yesterday = moment().subtract(1, 'day').toDate();

    // fields
    const typeField = this.field(props, 'type', fields);
    const timeField = this.field(props, 'time', fields);
    const userField = this.field(props, 'user', fields);
    const durationField = this.field(props, 'duration', fields);

    // page
    const eventPage = props.dashup.page(eventModel);

    // update
    return {
      stats : {
        calls : {
          avg : await eventPage.gt(timeField.name || timeField.uuid, yesterday).or({
            [typeField.name || typeField.uuid] : 'call:outbound',
          }, {
            [typeField.name || typeField.uuid] : 'call:inbound',
          }).avg(null, userField.name || userField.uuid),
          total : await eventPage.gt(timeField.name || timeField.uuid, yesterday).where({
            [userField.name || userField.uuid] : props.dashup.get('_meta.member'),
          }).or({
            [typeField.name || typeField.uuid] : 'call:outbound',
          }, {
            [typeField.name || typeField.uuid] : 'call:inbound',
          }).count(),
        },
        duration : {
          avg : await eventPage.gt(timeField.name || timeField.uuid, yesterday)
            .gt(durationField.name || durationField.uuid, 0).or({
            [typeField.name || typeField.uuid] : 'call:outbound',
          }, {
            [typeField.name || typeField.uuid] : 'call:inbound',
          }).avg(durationField.name || durationField.uuid, userField.name || userField.uuid),
          total : await eventPage.gt(timeField.name || timeField.uuid, yesterday).where({
            [userField.name || userField.uuid] : props.dashup.get('_meta.member'),
          }).gt(durationField.name || durationField.uuid, 0).or({
            [typeField.name || typeField.uuid] : 'call:outbound',
          }, {
            [typeField.name || typeField.uuid] : 'call:inbound',
          }).sum(durationField.name || durationField.uuid),
        }
      },
    }
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

    // get fields
    const fields = this.fields(props);

    // get fields
    const toField = this.field(props, 'to', fields) || {};
    const typeField = this.field(props, 'type', fields) || {};
    const itemField = this.field(props, 'item', fields) || {};
    const bodyField = this.field(props, 'body', fields) || {};
    const timeField = this.field(props, 'time', fields) || {};
    const userField = this.field(props, 'user', fields) || {};
    const fromField = this.field(props, 'from', fields) || {};
    const titleField = this.field(props, 'title', fields) || {};
    const durationField = this.field(props, 'duration', fields) || {};

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
      [itemField.name || itemField.uuid] : item,
      [userField.name || userField.uuid] : props.dashup.get('_meta.member'),
      [typeField.name || typeField.uuid] : type,
      [bodyField.name || bodyField.uuid] : body,
      [timeField.name || timeField.uuid] : time,
      [titleField.name || titleField.uuid] : title,
      [durationField.name || durationField.uuid] : duration,
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
   * get field
   */
  field(props, name, fields) {
    // return value
    return fields.find((field) => {
      // return fields
      return field.uuid === props.page.get(`data.event.${name}`);
    });
  }

  /**
   * get fields
   */
  fields(props) {
    // reduce
    return [props.page.get('data.event.form')].filter((i) => i).reduce((accum, id) => {
      // get page
      const page = props.dashup.page(id);

      // check page
      if (!page || !page.get('data.fields')) return accum;

      // loop fields
      accum.push(...page.get('data.fields').map((f) => {
        // return field
        return {
          ...f,

          form : page.get('_id'),
        };
      }));

      // return accum
      return accum;
    }, []);
  }

  /**
   * gets items
   *
   * @param props 
   */
  items(props) {
    // get column field
    const fields = props.context.fields || [];
    const sort = fields.find((f) => f.uuid === props.page.get('data.sort.id'));

    // return sorted
    return (props.items || []).filter((item) => {
      // return filter
      return this.filter(props, item);
    }).sort((a, b) => {
      // sort order
      let aC = a.get(sort ? (sort.name || sort.uuid) : `_meta.created`) || 0;
      let bC = b.get(sort ? (sort.name || sort.uuid) : `_meta.created`) || 0;

      // check object
      if (aC && typeof aC === 'object' && !(aC instanceof Date)) aC = JSON.stringify(aC);
      if (bC && typeof bC === 'object' && !(bC instanceof Date)) bC = JSON.stringify(bC);

      // check string
      if (typeof aC === 'string' && typeof bC === 'string') {
        // sort way
        if (props.page.get('data.sort.way') === -1) {
          // comnpare desc
          return bC.toLowerCase().localeCompare(aC.toLowerCase());
        }

        // compare asc
        return aC.toLowerCase().localeCompare(bC.toLowerCase());
      }

      // sort number
      if (props.page.get('data.sort.way') === -1) {
        if (bC > aC) return 1;
        if (bC < aC) return -1;
      }

      // check order
      if (bC > aC) return -1;
      if (bC < aC) return 1;
      return 0;
    });
  }

  /**
   * filter items
   *
   * @param props 
   * @param task 
   */
  filter(props, task) {
    // tags
    const tags = props.search && props.search.length ? props.search.toLowerCase().split(' ') : [];

    // check filter
    if (((props.page.get('user.filter') || {}).me || false)) {
      // check vals
      const userFields = [...(props.context.fields)].filter((f) => (props.page.get('data.user') || []).includes(f.uuid));

      // get vals
      let vals = userFields.reduce((accum, userField) => {
        // val
        let val = task.get(userField ? userField.name || userField.uuid : 'null') || [];

        // vals
        if (val && !Array.isArray(val)) val = [val];

        // push
        accum.push(...val);

        // return accum
        return accum;
      }, []);

      // only me
      if (!vals.find((val) => {
        // user
        return val.user === props.me.get('id');
      })) return false;
    }

    // check tags
    if ((props.page.get('user.filter.tags') || []).length) {
      // check vals
      const tagFields = [...(props.context.fields)].filter((f) => (props.page.get('data.tag') || []).includes(f.uuid));

      // check filter
      if (props.page.get('user.filter.tags').find((tag) => {
        // check tag exists on task
        const vals = tagFields.reduce((accum, tagField) => {
          // val
          let val = task.get(tagField ? tagField.name || tagField.uuid : 'null') || [];

          // vals
          if (val && !Array.isArray(val)) val = [val];

          // push
          accum.push(...val);

          // return accum
          return accum;
        }, []);

        // check tag
        return !vals.includes(tag);
      })) return false;
    }

    // filter
    if (tags.length) {
      // search item
      const searchable = JSON.stringify(task.get()).toLowerCase();

      // search JSON
      if (tags.find((tag) => {
        // check
        return !searchable.includes(tag);
      })) return false;
    }

    // return true
    return true;
  }
}

// create phone module
const phoneModule = eden.phone || new PhoneModule();

// set to eden
eden.phone = phoneModule;

// Create mixin
export default (toMix) => {
  // set dashup
  if (!toMix.phone) toMix.phone = phoneModule;

  // create safe update
  toMix.safeUpdate = () => {
    // update
    toMix.update();
  };

  // update
  phoneModule.on('update', toMix.safeUpdate);

  // init to module
  phoneModule.init(toMix).then((connection) => {
    // set connection
    toMix.connection = connection;
  });
};
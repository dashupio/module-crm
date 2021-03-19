
// import page interface
import Twilio from 'twilio';
import { v4 as uuid } from 'uuid';
import { Struct, Query, Model } from '@dashup/module';

/**
 * build address helper
 */
export default class PhonePage extends Struct {

  /**
   * construct
   */
  constructor(...args) {
    // return
    super(...args);

    // run listen
    this.authAction = this.authAction.bind(this);

    // save/sanitise
    this.listAction     = this.listAction.bind(this);
    this.sendAction     = this.sendAction.bind(this);
    this.numbersAction  = this.numbersAction.bind(this);
    this.purchaseAction = this.purchaseAction.bind(this);
    
    // incoming
    this.smsIncomingAction = this.smsIncomingAction.bind(this);
    this.callIncomingAction = this.callIncomingAction.bind(this);
    this.callOutgoingAction = this.callOutgoingAction.bind(this);
    this.callRecordingAction = this.callRecordingAction.bind(this);
  }

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'phone';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-phone';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Phone Page';
  }

  /**
   * returns page data
   */
  get data() {
    // set ids
    const ids = {
      event   : uuid(),
      contact : uuid(),
    };

    // return page data
    return {
      tabs : ['Contacts', 'Events', 'Numbers', 'Calls', 'Connects'],

      wizard : false ? null : {
        steps : [{
          _id   : ids.contact,
          type  : 'model',
          icon  : 'users fas',
          title : 'Contact Model',
        }, {
          _id   : ids.event,
          type  : 'model',
          icon  : 'play fas',
          title : 'Event Model',
        }, {
          _id    : uuid(),
          type   : 'form',
          icon   : 'plus fas',
          title  : 'Create',
          parent : ids.contact,
        }, {
          _id    : uuid(),
          type   : 'form',
          icon   : 'plus fas',
          title  : 'Create',
          parent : ids.event,
        }],
        base : {
          data : {

          }
        }
      },
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view     : 'page/phone/view',
      menu     : 'page/phone/menu',
      calls    : 'page/phone/calls',
      filter   : 'page/phone/filter',
      events   : 'page/phone/events',
      numbers  : 'page/phone/numbers',
      contacts : 'page/phone/contacts',
      connects : 'page/phone/connects',
    };
  }

  /**
   * actions
   */
  get actions() {
    // return actions
    return {
      auth : this.authAction,
      list : this.listAction,
      send : this.sendAction,

      numbers  : this.numbersAction,
      purchase : this.purchaseAction,

      'sms.incoming' : this.smsIncomingAction,
      'call.incoming' : this.callIncomingAction,
      'call.outgoing' : this.callOutgoingAction,
      'call.recording' : this.callRecordingAction,
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['Call'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Embeddable phone page';
  }

  /**
   * client
   */
  client() {
    // check client
    if (!this.__client) {
      // create client
      this.__client = Twilio(this.dashup.config.twilioSid, this.dashup.config.twilioAuth);
    }

    // return client
    return this.__client;
  }

  /**
   * sanitise action
   *
   * @param opts 
   * @param data 
   */
  async listAction(opts) {
    // query model
    const numbers = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
      dashup : opts.dashup,
    }).ne('phone', null).where({
      'order.payments.0.status' : 'active',
    }).find();

    // return data
    return (numbers || []).map((number) => {
      // return data
      return {
        _id    : number.get('_id'),
        _meta  : number.get('_meta'),
        order  : number.get('order'),
        number : number.get('number'),
      };
    });
  }

  /**
   * auth action
   *
   * @param opts 
   * @param data 
   */
  async authAction(opts, data) {
    // create voice grant
    const voiceGrant = new Twilio.jwt.AccessToken.VoiceGrant({
      incomingAllow          : true, // Optional: add to allow incoming calls
      outgoingApplicationSid : this.dashup.config.twilioApp,
    }); 

    // create access token
    const token = new Twilio.jwt.AccessToken(
      this.dashup.config.twilioSid,
      this.dashup.config.twilioKey,
      this.dashup.config.twilioSecret,
      {
        identity : opts.user
      }
    );
    token.addGrant(voiceGrant);

    // return data
    return {
      token : token.toJwt(),
    };
  }

  /**
   * auth action
   *
   * @param opts 
   * @param data 
   */
  async sendAction(opts, { body, from, to }) {
    // query model
    const number = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
      dashup : opts.dashup,
    }).ne('phone', null).where({
      'number.number'           : from,
      'order.payments.0.status' : 'active',
    }).findOne();

    // check number
    if (!number) {
      return false;
    }

    // client
    const client = this.client();

    // create
    try {
      // await create
      await client.messages
        .create({
          to,
          body,
          from,
        });
    } catch (e) {}

    // return data
    return true;
  }

  /**
   * sanitise action
   *
   * @param opts 
   * @param data 
   */
  async purchaseAction(opts, id, attempts = 0) {
    // domain
    const domain = this.dashup.config.url.includes('.dev') ? 'dashup.dev' : 'dashup.io';

    // query model
    const order = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      model  : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').findById(id);

    // await for later
    if (!order && attempts < 10) {
      // await try again
      return await new Promise((resolve, reject) => {
        // timeout
        setTimeout(() => {
          // promise
          this.purchaseAction(opts, id, attempts + 1).then(resolve).catch(reject);
        }, 500);
      });
    }

    // status
    if (order.get('order.payments.0.status') !== 'active') return {
      success : false,
      message : 'Order not active',
    };

    // status
    if (order.get('order.products.0.opts.dashup') !== opts.dashup) return {
      success : false,
      message : 'Dashup id does not match',
    };

    // status
    if (!order.get('order.products.0.opts.number.phoneNumber')) return {
      success : false,
      message : 'No phone number found',
    };

    // buy from twilio
    const client = this.client();
    let purchase = null;

    // try/catch
    try {
      // purchase number
      purchase = await client.incomingPhoneNumbers
        .create({
          smsUrl      : `https://${domain}/api/sms/incoming`,
          voiceUrl    : `https://${domain}/api/call/incoming`,
          phoneNumber : order.get('order.products.0.opts.number.phoneNumber'),
        });
    } catch (e) {
      // return error
      return {
        success : false,
        message : e.toString(),
      };
    }

    // update order
    order.set('page',   order.get('order.products.0.opts.page'));
    order.set('phone',  purchase.sid);
    order.set('dashup', order.get('order.products.0.opts.dashup'));
    order.set('number', order.get('order.products.0.opts.number.phoneNumber'));

    // save order
    await order.save({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      model  : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    });

    // get products
    return {
      result  : order.get(),
      success : true,
    };
  }

  /**
   * sanitise action
   *
   * @param opts 
   * @param data 
   */
  async numbersAction(opts, country) {
    // check client
    const client = this.client();

    // list numbers
    const numbers = [];

    // try/catch
    try {
      // push
      numbers.push(...(await client.availablePhoneNumbers(country).mobile.list({
        limit        : 25,
        smsEnabled   : true,
        voiceEnabled : true,
      })));
    } catch (e) {}
    try {
      // push
      numbers.push(...(await client.availablePhoneNumbers(country).local.list({
        limit        : 25,
        smsEnabled   : true,
        voiceEnabled : true,
      })));
    } catch (e) {}

    // return numbers
    return numbers;
  }

  /**
   * incoming sms action
   *
   * @param opts 
   * @param body 
   */
  async smsIncomingAction(opts, body) {
    // query model
    const number = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').ne('phone', null).where({
      'number.number'           : body.To,
      'order.payments.0.status' : 'active',
    }).findOne();

    // end
    if (!number) return null;

    // load form
    const page = await new Query({
      ...opts,

      dashup : number.get('dashup'),
    }, 'page').findById(number.get('page'));

    // end
    if (!page) return null;

    // get form
    const [form, item] = await new Query({
      ...opts,

      dashup : number.get('dashup'),
    }, 'page').findByIds([page.get('data.event.form'), page.get('data.forms.0')]);

    // if page
    if (!form || !item) return null;

    // item field
    const eventNumber = (item.get('data.fields') || []).find((f) => f.uuid === page.get('data.field.phone'));

    // find or create item
    let contacts = await new Query({
      page   : page.get('data.model'),
      model  : page.get('data.model'),
      dashup : page.get('_meta.dashup'),
    }, 'model').ne('phone', null).where({
      '_meta.model' : page.get('data.model'),
      [`${eventNumber.name || eventNumber.uuid}.number`] : body.From,
    }).find();

    // if no item
    if (!contacts || !contacts.length) {
      // create item
      contacts = [new Model({
        _meta : {
          form  : page.get('data.form'),
          page  : page.get('_id'),
          model : page.get('data.model'),
        },

        [eventNumber.name || eventNumber.uuid] : body.From,
      }, 'model')];

      // save item
      await contacts[0].save({
        form  : page.get('data.form'),
        page  : page.get('_id'),
        model : page.get('data.model'),
      });
    }

    // get fields
    const typeField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.type'));
    const itemField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.item'));
    const bodyField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.body'));
    const timeField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.time'));
    const titleField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.title'));

    // log number
    const incoming = new Model({
      _meta : {
        form  : page.get('data.event.form'),
        page  : page.get('_id'),
        model : page.get('data.event.model'),
      },

      [typeField.name || typeField.uuid]   : 'sms:inbound',
      [itemField.name || itemField.uuid]   : contacts.map((c) => c.get('_id')),
      [bodyField.name || bodyField.uuid]   : `${body.Body}`,
      [timeField.name || timeField.uuid]   : new Date(),
      [titleField.name || titleField.uuid] : `SMS From ${body.From} to ${body.To}`,
    }, 'model');

    // save
    await incoming.save({
      form  : page.get('data.event.form'),
      page  : page.get('_id'),
      model : page.get('data.event.model'),
    });

    // end
    return true;
  }

  /**
   * call incoming action
   *
   * @param opts 
   * @param body 
   */
  async callIncomingAction(opts, body) {
    // domain
    const domain = this.dashup.config.url.includes('.dev') ? 'dashup.dev' : 'dashup.io';

    // query model
    const number = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
      dashup : opts.dashup,
    }).ne('phone', null).where({
      'number.number'           : body.To,
      'order.payments.0.status' : 'active',
    }).findOne();

    // end
    if (!number) return null;

    // dial all clients
    const member = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : number.get('dashup'),
    }, 'member').where({
      page   : number.get('page'),
      status : 'active',
    }).findOne();

    // check member
    if (member) {
      // return string
      return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial record="record-from-ringing-dual"
  trim="do-not-trim"
  recordingStatusCallback="https://${domain}/api/call/recording/${encodeURIComponent(to)}/${encodeURIComponent(from)}/incoming"
  recordingStatusCallbackEvent="completed">
    <Client>${member.get('user.id')}</Client>
  </Dial>
</Response>`;
    }

    // load form
    const page = await new Query({
      ...opts,

      dashup : number.get('dashup'),
    }, 'page').findById(number.get('page'));

    // return item
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial record="record-from-ringing-dual"
  trim="do-not-trim"
  recordingStatusCallback="https://${domain}/api/call/recording/${encodeURIComponent(to)}/${encodeURIComponent(from)}/incoming"
  recordingStatusCallbackEvent="completed">
    <Client>
      <Number>
        ${page.get('data.forward')}
      </Number>
    </Client>
  </Dial>
</Response>`;
  }

  /**
   * call outgoing
   *
   * @param opts 
   * @param body 
   */
  async callOutgoingAction(opts, body) {
    // domain
    const domain = this.dashup.config.url.includes('.dev') ? 'dashup.dev' : 'dashup.io';

    // get details
    const {
      to,
      page,
      from,
      event,
      dashup,
    } = (body || {});

    // query model
    const number = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
      dashup : dashup,
    }).ne('phone', null).where({
      'number.number'           : from,
      'order.payments.0.status' : 'active',
    }).findOne();

    // return
    if (!number) return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="woman">Please purchase or select a number to make calls.</Say>
  <Reject />
</Response>`;

    // return call
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${from}" record="record-from-ringing-dual"
  trim="do-not-trim"
  recordingStatusCallback="https://${domain}/api/call/recording/${encodeURIComponent(to)}/${encodeURIComponent(from)}/${encodeURIComponent(event)}/outgoing"
  recordingStatusCallbackEvent="completed">
    <Number>${to}</Number>
  </Dial>
</Response>`;
  }

  /**
   * call recording action
   *
   * @param opts 
   * @param body 
   */
  async callRecordingAction(opts, body, params) {
    // get to/from/dir
    const { to, from, event, dir } = params;

    // find numbers
    const number = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').ne('phone', null).in('number.number', [from, to]).where({
      'order.payments.0.status' : 'active',
    }).findOne();

    // if no number
    if (!number) return null;

    // load form
    const page = await new Query({
      ...opts,

      dashup : number.get('dashup'),
    }, 'page').findById(number.get('page'));

    // end
    if (!page) return null;

    // call page
    const form = await new Query({
      ...opts,

      dashup : number.get('dashup'),
    }, 'page').findById(page.get('data.event.form'));
    
    // check form
    if (!form) return null;

    // type item
    const dateField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.date'));
    const recordingField = (form.get('data.fields') || []).find((f) => f.uuid === page.get('data.event.recording'));

    // query model
    const lastCall = await new Query({
      form  : page.get('data.event.form'),
      page  : page.get('_id'),
      model : page.get('data.event.model'),
    }, 'model').findById(event);

    // last call
    if (!lastCall) return null;

    // try/catch
    try {
      // set on last call
      if (dateField) lastCall.set(`${dateField.name || dateField.uuid}.duration`, parseInt(body.RecordingDuration) * 1000);
      if (recordingField) lastCall.set(recordingField.name || recordingField.uuid, body.RecordingUrl);

      // save
      await lastCall.save({
        form  : page.get('data.event.form'),
        page  : page.get('_id'),
        model : page.get('data.event.model'),
      });
    } catch (e) {}

    // return true
    return true;
  }
}
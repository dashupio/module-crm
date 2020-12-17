
// import page interface
import Twilio from 'twilio';
import { v4 as uuid } from 'uuid';
import { Struct, Query } from '@dashup/module';

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
      tabs : ['Contacts', 'Events', 'Numbers', 'Connects', 'Scripts'],

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
      events   : 'page/phone/events',
      filter   : 'page/phone/filter',
      scripts  : 'page/phone/scripts',
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
      ...opts,

      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
    //  page   : opts.page,
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
  async sendAction(opts, { body, from, to}) {
    // query model
    const number = await new Query({
      ...opts,

      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
      page   : opts.page,
      dashup : opts.dashup,
    }).ne('phone', null).where({
      number                    : from,
      'order.payments.0.status' : 'active',
    }).findOne();

    // check number
    if (!number) {
      return false;
    }

    // client
    const client = this.client();

    // create
    client.messages
      .create({
        to,
        body,
        from,
      });

    // return data
    return true;
  }

  /**
   * sanitise action
   *
   * @param opts 
   * @param data 
   */
  async purchaseAction(opts, id) {
    // domain
    const domain = this.dashup.config.url.includes('.dev') ? 'dashup.dev' : 'dashup.io';

    // query model
    const order = await new Query({
      ...opts,

      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      model  : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').findById(id);

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
      ...opts,

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
}
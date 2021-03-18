// require first
const axios = require('axios');
const { Module } = require('@dashup/module');

// import base
const SMSAction = require('./actions/sms');
const PhonePage = require('./pages/phone');
const EventsBlock = require('./blocks/events');
const ContactBlock = require('./blocks/contact');

/**
 * export module
 */
class CRMModule extends Module {

  /**
   * construct discord module
   */
  constructor() {
    // run super
    super();
  }
  
  /**
   * register functions
   *
   * @param {*} fn 
   */
  register(fn) {
    // register pages
    fn('page', PhonePage);

    // register actions
    fn('action', SMSAction);

    // register blocks
    fn('block', EventsBlock);
    fn('block', ContactBlock);
  }

  /**
   * send
   *
   * @param to 
   * @param from 
   * @param text 
   */
  send(to, from, body) {
    // await res
    return axios.post(`${this.config.apiUrl}messages`, {
      to,
      from,
      body,
    }, {
      headers : {
        Authorization : `Bearer ${this.config.apiToken}`,
      }
    });
  }
}

// create new
module.exports = new CRMModule();

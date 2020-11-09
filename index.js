// require first
const axios = require('axios');
const { Module } = require('@dashup/module');

// import base
const SMSAction = require('./actions/sms');
const PhonePage = require('./pages/phone');

/**
 * export module
 */
class PhoneModule extends Module {

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
    // register sms action
    fn('page', PhonePage);
    fn('action', SMSAction);
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
module.exports = new PhoneModule();

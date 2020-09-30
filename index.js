// require first
const axios = require('axios');
const { Module } = require('@dashup/module');

// import base
const SMSAction = require('./actions/sms');

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
   * Register all action interfaces here
   * 
   * ```
   * // register connect class
   * register(Action);
   * ```
   * 
   * Class `Action` should extend `require('@dashup/module').Action`
   * 
   * @param {Function} register 
   */
  actions(register) {
    // register sms action
    register(SMSAction);
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
    return axios.post(`${this.dashup.config.smsUrl}messages`, {
      to,
      from,
      body,
    }, {
      headers : {
        Authorization : `Bearer ${this.dashup.config.token}`,
      }
    });
  }
}

// create new
module.exports = new PhoneModule();

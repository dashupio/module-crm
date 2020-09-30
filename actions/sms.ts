
// import connect interface
import { Action } from '@dashup/module';

/**
 * build address helper
 */
export default class SMSAction extends Action {
  /**
   * construct sms connector
   *
   * @param args 
   */
  constructor(...args) {
    // run super
    super(...args);
  }

  /**
   * returns connect type
   */
  get type() {
    // return connect type label
    return 'sms';
  }

  /**
   * returns connect type
   */
  get title() {
    // return connect type label
    return 'SMS';
  }

  /**
   * returns connect icon
   */
  get icon() {
    // return connect icon label
    return 'fa fa-phone';
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      config : 'action/sms/config',
    };
  }

  /**
   * returns category list for connect
   */
  get categories() {
    // return array of categories
    return ['phone'];
  }

  /**
   * returns connect descripton for list
   */
  get description() {
    // return description string
    return 'SMS Actionor';
  }

  /**
   * action method
   *
   * @param param0 
   * @param action 
   * @param data 
   */
  async run({ req, dashup }, action, data) {
    
  }
}
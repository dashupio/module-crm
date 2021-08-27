
// import connect interface
import handlebars from 'handlebars';
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class SMSAction extends Struct {

  /**
   * construct
   */
  constructor(...args) {
    // return
    super(...args);

    // run listen
    this.runAction = this.runAction.bind(this);
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
    return 'fad fa-sms';
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      config : 'action/sms',
    };
  }

  /**
   * returns object of views
   */
  get actions() {
    // return object of views
    return {
      run : this.runAction,
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
    return 'Send SMS(s)';
  }

  /**
   * action method
   *
   * @param param0 
   * @param action 
   * @param data 
   */
  async runAction(opts, action, data) {
    // send
    if (!action.to) return;

    // template
    const toTemplate = handlebars.compile(action.to);

    // replace with data
    const to = toTemplate(data || {});

    // template
    const fromTemplate = handlebars.compile(action.from);

    // replace with data
    const from = fromTemplate(data || {});

    // template
    const bodyTemplate = handlebars.compile(action.body);

    // replace with data
    const body = bodyTemplate(data || {});

    // get to
    const actualTo = to.split(',').map((item) => item && item.trim().length ? item.trim() : null).filter((f) => f);

    // check to
    if (!actualTo.length) return;

    // send
    actualTo.forEach((subTo) => {
      // sub to
      this.dashup.send(subTo, from, body);
    });

    // return data
    return {
      data,
    };
  }
}

// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class ContactBlock extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'contact';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-address-book';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Contact Block';
  }

  /**
   * returns page data
   */
  get data() {
    // return page data
    return {};
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view   : 'block/contact/view',
      config : 'block/contact/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['phone'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Send email, sms, or create note for a contact';
  }
}
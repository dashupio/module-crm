
// import page interface
import { Struct, Query, Model } from '@dashup/module';

/**
 * build address helper
 */
export default class BulkPage extends Struct {

  /**
   * construct
   */
  constructor(...args) {
    // return
    super(...args);
    
  }

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'bulk';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-envelope-open-text';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Bulk Marketing Page';
  }

  /**
   * returns page data
   */
  get data() {
    // return page data
    return {
      tabs : ['Contacts', 'Events', 'Connects'],
    };
  }

  /**
   * returns object of views
   */
  get views() {
    // return object of views
    return {
      view     : 'page/bulk',
      events   : 'page/bulk/events',
      contacts : 'page/bulk/contacts',
    };
  }

  /**
   * actions
   */
  get actions() {
    // return actions
    return {
      
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
    return 'Bulk Marketing Page';
  }
}
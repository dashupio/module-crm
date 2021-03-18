
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class EventsBlock extends Struct {

  /**
   * returns page type
   */
  get type() {
    // return page type label
    return 'events';
  }

  /**
   * returns page type
   */
  get icon() {
    // return page type label
    return 'fa fa-calendar-alt';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Events Block';
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
      view   : 'block/events/view',
      config : 'block/events/config',
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
    return 'Create a list of contact events';
  }
}
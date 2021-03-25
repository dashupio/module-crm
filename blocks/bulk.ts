
// import page interface
import { Struct } from '@dashup/module';

/**
 * build address helper
 */
export default class BulkBlock extends Struct {

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
    return 'Bulk Contact Block';
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
      view   : 'block/bulk/view',
      config : 'block/bulk/config',
    };
  }

  /**
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['bulk'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Bulk Contact Block';
  }
}
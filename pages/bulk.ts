
// import page interface
import Twilio from 'twilio';
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

    // bind actions
    this.listAction = this.listAction.bind(this);
    this.bulkAction = this.bulkAction.bind(this);
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
    return 'fad fa-envelope-open-text text-info';
  }

  /**
   * returns page type
   */
  get title() {
    // return page type label
    return 'Marketing';
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
      list : this.listAction,
      bulk : this.bulkAction,
    };
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
   * returns category list for page
   */
  get categories() {
    // return array of categories
    return ['Communication'];
  }

  /**
   * returns page descripton for list
   */
  get description() {
    // return description string
    return 'Send bulk sms or email to targeted groups';
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
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').where({
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
   * bulk action
   */
  async bulkAction(opts, { from, subject, number, query, selected, message }) {
    // load number
    const useNumber = await new Query({
      form   : '5fa8f1ba5cc2fcc84ff61ec4',
      page   : '5fa8f1ad5cc2fcc84ff61ec0',
      dashup : '5efdbeafdd5a8af0344187ed',
    }, 'model').findById(number);

    // load number
    const bulkPage = await new Query(opts, 'page').findById(opts.page);
    const formPages = bulkPage ? await new Query(opts, 'page').findByIds(bulkPage.get('data.forms')) : [];
    const formFields = formPages ? formPages.reduce((accum, page) => {
      // push to accum
      accum.push(...(page.get('data.fields') || []));

      // return accum
      return accum;
    }, []) : [];
    const phoneField = formFields.find((f) => f.uuid === bulkPage.get('data.field.phone'));

    // check phone field
    if (!phoneField) return 0;

    // get query
    const getQuery = () => {
      // items
      let items = new Query({
        ...opts,
        
        form  : bulkPage.get('data.forms.0'),
        page  : bulkPage.get('data.model'),
      }, 'model');

      // query
      query.forEach((q) => {
        items = items[q[0]](...q[1]);
      });

      // add match by selected
      if (selected.type === 'items') {
        items = items.in('_id', selected.items);
      } else if (selected.type === 'minus') {
        items = items.nin('_id', selected.items);
      }

      // return
      return items;
    };

    // get total
    const count = await getQuery().count();

    // @todo batch
    const actualItems = await getQuery().find();

    // client
    const client = this.client();

    // loop items
    actualItems.forEach(async (item) => {
      // create
      try {
        // await create
        await client.messages
          .create({
            to   : item.get(`${phoneField.name || phoneField.uuid}.number`),
            body : message,
            from : useNumber.get('number.number'),
          });
      } catch (e) { console.log(e) }
    });

    // return count
    return count;
  }
}
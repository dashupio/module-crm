
// import react
import Dashup from '@dashup/core';
import countries from 'country-list';
import { View, Select } from '@dashup/ui';
import React, { useState, useEffect } from 'react';

// create page model config
const PagePhoneNumbers = (props = {}) => {
  // set state
  const [tab, setTab] = useState('list');
  const [guest, setGuest] = useState(null);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [number, setNumber] = useState(null);
  const [country, setCountry] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);

  // is dark
  const isDark = () => {
    // settings
    if (window.matchMedia('(prefers-color-scheme: dark)').matches && !(document.body.getAttribute('class') || '').includes('light')) return true;

    // no dark
    return false;
  };
      
  // get countries
  const getCountries = () => {
    // loop
    return countries.getCodes().map((code) => {
      // return fields
      return {
        label    : countries.getName(code),
        value    : code,
        selected : country === code,
      };
    });
  };

  /**
   * load numbers
   */
  const loadNumbers = async (c) => {
    // loading
    setLoading('numbers');

    // load from page
    const loadedNumbers = await props.page.action('numbers', c);

    // update
    setNumbers(loadedNumbers);
    setLoading(false);
  }

  // on country
  const onCountry = (value) => {
    // set country
    setCountry(value?.value);
    setNumbers([]);
    if (value?.value) loadNumbers(value?.value);
  };

  // on purchase
  const onPurchase = async (number) => {
    // check guest
    if (!guest) return;

    // update
    setTab('checkout');
    setNumber(number);
    setLoading('checkout');

    // load plan
    const actualNumber = await eden.guest.page('5fa8d64fce9ecf0d7bfa4327').where({
      sku : 'number',
    }).findOne();

    // add
    await eden.guest.page('5fa8f18e5cc2fcc84ff61ebb').clear();
    await eden.guest.page('5fa8f18e5cc2fcc84ff61ebb').add(actualNumber, 1, {
      page   : props.page.get('_id'),
      dashup : props.dashup.get('_id'),
      number : number,
    });

    // building
    setLoading(false);
  };

  // on success
  const onSuccess = async (order) => {
    // load order
    setLoading('order');
    setOrder(order);
    setTab('order');
    
    // set tab
    const data = await props.page.action('purchase', order.get('_id'));

    // error
    if (!data.success) {
      // update
      setTab('checkout');
      setError(data.message);

      // false
      return setLoading(false);
    }

    // loop data
    Object.keys(data.result).forEach((key) => {
      // set value
      order.set(key, data.result[key]);
    });

    // update
    setLoading(false);
    
    // emit
    props.page.emit('numbers', true);
  };

  // use effect
  useEffect(() => {
    // load guest dashup
    if (eden.state.guest && !eden.guest) {
      // set guest dashup
      eden.guest = new Dashup(eden.state.guest);
    }

    // check guest
    if (!eden.guest) return;

    // await building
    eden.guest.building.then(() => setGuest(eden.guest));
  }, [eden.state.guest?.key]);
  
  // return jsx
  return (
    <>
      { tab === 'list' && (
        <>
          { !!error && (
            <div className="alert alert-danger mb-3">
              Error: { error }
            </div>
          ) }
          <div className="mb-3">
            <label className="form-label">
              Select Country
            </label>
            <div className="d-flex flex-row">
              <div className="flex-1">
                <Select options={ getCountries() } defaultValue={ getCountries().filter((f) => f.selected) } onChange={ onCountry } isClearable />
              </div>
            </div>
          </div>
          { !!loading && (
            <div className="my-4 text-center">
              <i className="h1 fa fa-spinner fa-spin" />
            </div>
          ) }
          { !!(numbers && numbers.length) && (
            numbers.map((number, i) => {
              // return jsx
              return (
                <div key={ `number-${number.phoneNumber}` } className="card mb-2">
                  <div className="card-body d-flex align-items-center">
                    <button className="btn me-3 btn-primary">
                      { number.region || number.isoCountry }
                    </button>

                    <div>
                      <b className="d-block">
                        { number.phoneNumber }
                      </b>
                      <small>
                        { number.locality } { number.friendlyName }
                      </small>
                    </div>

                    <div className="ms-auto">
                      { !!number.capabilities.SMS && (
                        <button className="me-2 btn btn-link" title="SMS enabled" data-toggle="tooltip">
                          <i className="fa fa-sms me-2" />
                          $0.02 /sms
                        </button>
                      ) }
                      { !!number.capabilities.voice && (
                        <button className="me-2 btn btn-link" title="Voice enabled" data-toggle="tooltip">
                          <i className="fa fa-phone me-2" />
                          $0.02 /min
                        </button>
                      ) }
                    </div>

                    <button className="btn ms-3 me-0 btn-success" onClick={ (e) => onPurchase(number) }>
                      <i className="fa fa-shopping-cart me-2" />
                      $9.99 /m
                    </button>
                  </div>
                </div>
              );
            })
            
          ) }
        </>
      ) }
      { tab === 'order' && (
        loading ? (
          <div className="my-4 text-center">
            <i className="h1 fa fa-spinner fa-spin" />
          </div>
        ) : (
          <View
            type="page"
            view="order"
            struct="checkout"

            page={ guest.page('5f93c54d267be3000f6fe19e') }
            logo={ `/public/assets/images/logo-${isDark() ? 'white' : 'color'}.svg` }
            order={ order.get('_id') }
            dashup={ guest }
            classes={ {
              orderMain    : 'col-12 mt-5',
              orderSidebar : 'd-none',
            } }
          />
        )
      ) }
      { tab === 'checkout' && (
        loading === 'checkout' ? (
          <div className="my-4 text-center">
            <i className="h1 fa fa-spinner fa-spin" />
          </div>
        ) : (
          <View
            type="page"
            view="checkout"
            struct="checkout"
  
            page={ guest.page('5fa8f18e5cc2fcc84ff61ebb') }
            logo={ `/public/assets/images/logo-${isDark() ? 'white' : 'color'}.svg` }
            back={ `/app/${props.page.get('_id')}` }
            email={ eden.user.get('email') }
            dashup={ guest }
  
            onSuccess={ onSuccess }
  
            classes={ {
              checkoutLogo            : 'd-none',
              checkoutMain            : 'dashup-checkout-main col-12 order-1 mt-5',
              checkoutSteps           : 'd-none',
              checkoutSidebar         : 'dashup-checkout-cart col-12',
              checkoutCompleteBtn     : 'btn btn-primary ps-auto',
              checkoutCompleteBack    : 'd-none',
              checkoutCompleteBtnWrap : 'col-12 text-right',
            } }
          />
        )
      ) }
    </>
  )
};

// export default
export default PagePhoneNumbers;
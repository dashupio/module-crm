
// import react
import Select from 'react-select';
import countries from 'country-list';
import React, { useState } from 'react';

// create page model config
const PagePhoneNumbers = (props = {}) => {
  // set state
  const [tab, setTab] = useState('buy');
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);
  const [number, setNumber] = useState(null);
  const [country, setCountry] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
      
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
    console.log(c, numbers);
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
  
  // return jsx
  return (
    <>
      { tab === 'purchase' && (
        <div>
          <p className="lead my-5 text-center">
            Purchasing <b>{ number.friendlyName }</b>
          </p>
          <div id="checkout" />
        </div>
      ) }
      { tab === 'number' && (
        <div>
          <p className="lead my-5 text-center">
            <b>{ order.get('number') }</b>
          </p>
          <div id="order" />
        </div>
      ) }
      { tab === 'buy' && (
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

                    <button className="btn ms-3 me-0 btn-success" onClick={ (e) => onPurchase(e, number) }>
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
    </>
  )
};

// export default
export default PagePhoneNumbers;